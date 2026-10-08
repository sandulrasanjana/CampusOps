const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const { verifyToken } = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware & CORS configuration reading process.env.FRONTEND_URL
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, true);
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
  })
);
app.use(express.json());

// 1. Health Check Endpoint (Public - No Auth Required)
const handleHealthCheck = async (req, res) => {
  try {
    let dbStatus = 'connected';
    let dbTime = null;
    try {
      const result = await db.query('SELECT NOW() as current_time');
      dbTime = result.rows[0]?.current_time;
    } catch (dbErr) {
      dbStatus = 'disconnected';
      console.warn('Health check DB warning:', dbErr.message);
    }

    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      message: 'CampusOps Backend API is running',
      database: dbStatus,
      dbTime
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    });
  }
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Protect sensitive API routes with Firebase ID token verification
app.use('/api/incidents', verifyToken);
app.use('/api/users', verifyToken);
app.use('/api/analytics', verifyToken);

// 2. Incidents Endpoints
// GET /api/incidents - List all incidents (with optional query filters: status, category, priority)
app.get('/api/incidents', async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let baseQuery = `
      SELECT 
        i.id,
        i.incident_number,
        i.title,
        i.description,
        i.category,
        i.location,
        i.priority,
        i.status,
        i.created_at,
        i.updated_at,
        i.reported_by,
        i.assigned_to,
        u_rep.name AS reporter_name,
        u_rep.email AS reporter_email,
        u_tech.name AS assigned_technician_name,
        u_tech.email AS assigned_technician_email
      FROM incidents i
      LEFT JOIN users u_rep ON i.reported_by = u_rep.id
      LEFT JOIN users u_tech ON i.assigned_to = u_tech.id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`i.status = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`i.category = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      conditions.push(`i.priority = $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += ` WHERE ` + conditions.join(' AND ');
    }

    baseQuery += ` ORDER BY i.created_at DESC`;

    const result = await db.query(baseQuery, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching incidents:', error.message);
    res.status(500).json({ error: 'Failed to fetch incidents', details: error.message });
  }
});

// GET /api/incidents/:id - Get single incident by ID or incident_number
app.get('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const isNumeric = /^\d+$/.test(id);
    const query = `
      SELECT 
        i.*,
        u_rep.name AS reporter_name,
        u_rep.email AS reporter_email,
        u_tech.name AS assigned_technician_name,
        u_tech.email AS assigned_technician_email
      FROM incidents i
      LEFT JOIN users u_rep ON i.reported_by = u_rep.id
      LEFT JOIN users u_tech ON i.assigned_to = u_tech.id
      WHERE ${isNumeric ? 'i.id = $1' : 'i.incident_number = $1'}
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    // Fetch comments for this incident
    const commentsQuery = `
      SELECT c.*, u.name AS author_name, r.name AS author_role
      FROM incident_comments c
      JOIN users u ON c.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE c.incident_id = $1
      ORDER BY c.created_at ASC
    `;
    const commentsResult = await db.query(commentsQuery, [result.rows[0].id]);

    res.json({
      ...result.rows[0],
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error(`Error fetching incident ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch incident', details: error.message });
  }
});

// POST /api/incidents - Create a new incident
app.post('/api/incidents', async (req, res) => {
  const { title, description, category, location, priority, reported_by } = req.body;
  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reporterId = reported_by || 1;

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM incidents');
    const totalCount = countResult.rows[0].count ? parseInt(countResult.rows[0].count, 10) : countResult.rows.length;
    const newNumber = `INC-${1000 + totalCount + 1}`;

    const query = `
      INSERT INTO incidents (incident_number, title, description, category, location, priority, reported_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [newNumber, title, description, category, location, priority || 'MEDIUM', reporterId];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating incident:', error.message);
    res.status(500).json({ error: 'Failed to create incident', details: error.message });
  }
});

// Helper function for updating incident status or assignment
async function updateIncident(idParam, bodyData, res) {
  const { status, assigned_to, changed_by } = bodyData;

  try {
    const isNumeric = /^\d+$/.test(idParam);
    const findQuery = `SELECT * FROM incidents WHERE ${isNumeric ? 'id = $1' : 'incident_number = $1'}`;
    const existingResult = await db.query(findQuery, [idParam]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const currentIncident = existingResult.rows[0];
    const numericId = currentIncident.id;
    const newStatus = status || currentIncident.status;
    const newAssignedTo = assigned_to !== undefined ? assigned_to : currentIncident.assigned_to;

    const updateQuery = `
      UPDATE incidents
      SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await db.query(updateQuery, [newStatus, newAssignedTo, numericId]);

    // Log history if status changed
    if (status && status !== currentIncident.status) {
      await db.query(
        'INSERT INTO incident_history (incident_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
        [numericId, currentIncident.status, status, changed_by || null]
      );
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(`Error updating incident ${idParam}:`, error.message);
    res.status(500).json({ error: 'Failed to update incident', details: error.message });
  }
}

// PATCH /api/incidents/:id - Update incident
app.patch('/api/incidents/:id', async (req, res) => {
  await updateIncident(req.params.id, req.body, res);
});

// PATCH /api/incidents/:id/status - Alias for status update
app.patch('/api/incidents/:id/status', async (req, res) => {
  await updateIncident(req.params.id, req.body, res);
});

// POST /api/incidents/:id/comments - Add comment to an incident
app.post('/api/incidents/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_id, comment } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    const findQuery = `SELECT id FROM incidents WHERE ${isNumeric ? 'id = $1' : 'incident_number = $1'}`;
    const existingResult = await db.query(findQuery, [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const numericId = existingResult.rows[0].id;
    const authorId = user_id || 1;

    const insertQuery = `
      INSERT INTO incident_comments (incident_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [numericId, authorId, comment.trim()]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error adding comment to incident ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// 3. Users Endpoints
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.student_id, u.department, u.created_at, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// 4. Analytics Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const totalIncidents = await db.query('SELECT COUNT(*) FROM incidents');
    const statusCounts = await db.query('SELECT status, COUNT(*) FROM incidents GROUP BY status');
    const priorityCounts = await db.query('SELECT priority, COUNT(*) FROM incidents GROUP BY priority');
    const categoryCounts = await db.query('SELECT category, COUNT(*) FROM incidents GROUP BY category');

    res.json({
      totalIncidents: parseInt(totalIncidents.rows[0].count, 10),
      byStatus: statusCounts.rows,
      byPriority: priorityCounts.rows,
      byCategory: categoryCounts.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`CampusOps Backend API server running on port ${PORT}`);
});
