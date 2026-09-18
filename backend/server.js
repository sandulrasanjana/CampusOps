const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.json({
      status: 'OK',
      message: 'CampusOps Backend API is running',
      dbTime: result.rows[0].current_time
    });
  } catch (error) {
    const errDetails = error.message || String(error) || 'Connection timed out or failed';
    console.error('Health check database error:', errDetails);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection error',
      error: errDetails
    });
  }
});

// 2. Incidents Endpoints
// GET /api/incidents - List all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const query = `
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
        u_rep.name AS reporter_name,
        u_rep.email AS reporter_email,
        u_tech.name AS assigned_technician_name,
        u_tech.email AS assigned_technician_email
      FROM incidents i
      LEFT JOIN users u_rep ON i.reported_by = u_rep.id
      LEFT JOIN users u_tech ON i.assigned_to = u_tech.id
      ORDER BY i.created_at DESC
    `;
    const result = await db.query(query);
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
  if (!title || !description || !category || !location || !reported_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM incidents');
    const newNumber = `INC-${1000 + parseInt(countResult.rows[0].count, 10) + 1}`;

    const query = `
      INSERT INTO incidents (incident_number, title, description, category, location, priority, reported_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [newNumber, title, description, category, location, priority || 'MEDIUM', reported_by];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating incident:', error.message);
    res.status(500).json({ error: 'Failed to create incident', details: error.message });
  }
});

// PATCH /api/incidents/:id - Update incident status or assignment
app.patch('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assigned_to, changed_by } = req.body;

  try {
    // Get existing incident
    const existingResult = await db.query('SELECT * FROM incidents WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const currentIncident = existingResult.rows[0];
    const newStatus = status || currentIncident.status;
    const newAssignedTo = assigned_to !== undefined ? assigned_to : currentIncident.assigned_to;

    const updateQuery = `
      UPDATE incidents
      SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await db.query(updateQuery, [newStatus, newAssignedTo, id]);

    // Log history if status changed
    if (status && status !== currentIncident.status) {
      await db.query(
        'INSERT INTO incident_history (incident_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
        [id, currentIncident.status, status, changed_by || null]
      );
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(`Error updating incident ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to update incident', details: error.message });
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
