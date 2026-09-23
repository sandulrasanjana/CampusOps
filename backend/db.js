const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = (process.env.DATABASE_URL || '').trim();

let useSqlite = false;
let sqliteDb = null;
let pgPool = null;

// Initialize PostgreSQL pool
if (connectionString) {
  pgPool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('supabase')
      ? { rejectUnauthorized: false }
      : false,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000
  });

  pgPool.on('error', (err) => {
    console.error('[CampusOps DB] PostgreSQL pool error:', err.message || err);
  });
}

function initSqlite() {
  if (sqliteDb) return sqliteDb;

  const dbPath = path.join(__dirname, 'campusops.db');
  console.log(`[CampusOps DB] Initializing local SQLite database at ${dbPath}`);

  sqliteDb = new sqlite3.Database(dbPath);

  sqliteDb.serialize(() => {
    // Create tables
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
      );
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL REFERENCES roles(id),
        student_id TEXT,
        department TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_number TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'REPORTED',
        reported_by INTEGER NOT NULL REFERENCES users(id),
        assigned_to INTEGER REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS incident_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS incident_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_by INTEGER REFERENCES users(id),
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default data if empty
    sqliteDb.get("SELECT COUNT(*) as count FROM roles", (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('[CampusOps DB] Seeding initial data into SQLite database...');
        sqliteDb.run(`INSERT INTO roles (id, name, description) VALUES
          (1, 'STUDENT', 'University student reporting and tracking campus incidents'),
          (2, 'FACULTY', 'Academic and administrative campus staff'),
          (3, 'TECHNICIAN', 'Field technician resolving assigned tickets and incidents'),
          (4, 'ADMIN', 'System administrator monitoring system health and analytics');`);

        sqliteDb.run(`INSERT INTO users (id, name, email, password_hash, role_id, student_id, department) VALUES
          (1, 'Sandul Rasanjana', 'sandul@campus.ac.lk', '$2b$10$demoHashStudentPass', 1, 'STU-89241', 'Information Systems'),
          (2, 'Alex Rivers', 'tech.alex@campus.ac.lk', '$2b$10$demoHashTechPass', 3, 'EMP-1022', 'Campus IT Services'),
          (3, 'Eleanor Vance', 'admin@campus.ac.lk', '$2b$10$demoHashAdminPass', 4, 'EMP-0014', 'Infrastructure & Operations');`);

        sqliteDb.run(`INSERT INTO incidents (id, incident_number, title, description, category, location, priority, status, reported_by, assigned_to) VALUES
          (1, 'INC-1042', 'Projector malfunction in Room 302', 'HDMI port flickers repeatedly and cuts out during lecture slides.', 'Classroom AV', 'Computing Complex - Room 302', 'HIGH', 'IN_PROGRESS', 1, 2),
          (2, 'INC-1038', 'Leaking pipe in North Wing Restroom', 'Water leaking onto the floor near sink basin, potential slip hazard.', 'Facilities', 'North Wing 2nd Floor', 'MEDIUM', 'REPORTED', 1, NULL),
          (3, 'INC-1035', 'Wi-Fi connectivity dropping in Library', 'Eduroam access point frequently dropping connections during peak hours.', 'Network', 'Main Library 1st Floor', 'MEDIUM', 'RESOLVED', 1, 2);`);

        sqliteDb.run(`INSERT INTO incident_comments (incident_id, user_id, comment) VALUES
          (1, 1, 'Issue started around 09:15 during CS lecture.'),
          (1, 2, 'Technician assigned. Replacing HDMI wall connector module.');`);
      }
    });
  });

  return sqliteDb;
}

// Convert PostgreSQL query dialect to SQLite query dialect
function adaptQueryForSqlite(text, params = []) {
  let paramIdx = 1;
  let adaptedText = text.replace(/\$(\d+)/g, () => '?');

  // Convert SELECT NOW() or SELECT NOW() as ...
  adaptedText = adaptedText.replace(/NOW\(\)/gi, "datetime('now')");
  
  // Convert CURRENT_TIMESTAMP - INTERVAL ... if present
  adaptedText = adaptedText.replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'([^']+)'/gi, (match, p1) => {
    return `datetime('now', '-${p1}')`;
  });

  // Convert SELECT COUNT(*) FROM ... without alias to SELECT COUNT(*) AS count
  adaptedText = adaptedText.replace(/SELECT\s+COUNT\(\*\)\s+FROM/gi, 'SELECT COUNT(*) AS count FROM');

  return { text: adaptedText, params };
}

// Universal query method compatible with pg format
async function query(text, params = []) {
  if (!useSqlite && pgPool) {
    try {
      const res = await pgPool.query(text, params);
      return res;
    } catch (err) {
      console.warn(`[CampusOps DB] Cloud PostgreSQL query failed (${err.message}). Switching to local SQLite mode.`);
      useSqlite = true;
      initSqlite();
    }
  }

  // SQLite execution path
  if (!sqliteDb) {
    initSqlite();
  }

  const adapted = adaptQueryForSqlite(text, params);

  return new Promise((resolve, reject) => {
    const isSelect = adapted.text.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
      sqliteDb.all(adapted.text, adapted.params, (err, rows) => {
        if (err) return reject(err);
        // Normalize SQLite row count key if needed
        const normalizedRows = (rows || []).map(row => {
          if (row['COUNT(*)'] !== undefined && row.count === undefined) {
            row.count = row['COUNT(*)'];
          }
          return row;
        });
        resolve({ rows: normalizedRows });
      });
    } else {
      // INSERT / UPDATE / DELETE
      // Check if RETURNING * is in query
      const hasReturning = /RETURNING\s+\*/i.test(adapted.text);
      const cleanText = adapted.text.replace(/RETURNING\s+\*/gi, '').trim();

      sqliteDb.run(cleanText, adapted.params, function (err) {
        if (err) return reject(err);
        
        if (hasReturning) {
          // Fetch inserted or updated row
          const tableMatch = cleanText.match(/(?:INSERT INTO|UPDATE)\s+([a-zA-Z0-9_]+)/i);
          const tableName = tableMatch ? tableMatch[1] : null;

          if (tableName && this.lastID) {
            sqliteDb.get(`SELECT * FROM ${tableName} WHERE id = ?`, [this.lastID], (fetchErr, row) => {
              if (fetchErr) return resolve({ rows: [{ id: this.lastID }] });
              resolve({ rows: [row] });
            });
            return;
          } else if (tableName && adapted.params && adapted.params.length > 0) {
            const lastParam = adapted.params[adapted.params.length - 1];
            sqliteDb.get(`SELECT * FROM ${tableName} WHERE id = ?`, [lastParam], (fetchErr, row) => {
              if (fetchErr) return resolve({ rows: [row || {}] });
              resolve({ rows: [row] });
            });
            return;
          }
        }
        resolve({ rows: [], rowCount: this.changes });
      });
    }
  });
}

// Initial health check on module load to test PG connection asynchronously
if (pgPool) {
  pgPool.query('SELECT 1')
    .then(() => {
      console.log('[CampusOps DB] Successfully connected to PostgreSQL cloud database.');
    })
    .catch((err) => {
      console.log(`[CampusOps DB] PostgreSQL connection unavailable (${err.message}). Using local SQLite database.`);
      useSqlite = true;
      initSqlite();
    });
} else {
  useSqlite = true;
  initSqlite();
}

module.exports = {
  query
};
