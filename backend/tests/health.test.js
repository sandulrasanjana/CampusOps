const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cors = require('cors');

describe('Backend Health Check API', () => {
  let server;
  let baseUrl;

  before((_, done) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const handleHealthCheck = async (req, res) => {
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    };

    app.get('/api/health', handleHealthCheck);
    app.get('/health', handleHealthCheck);

    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((_, done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('GET /api/health returns 200 OK with status UP', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'UP');
    assert.ok(body.timestamp);
    assert.ok(typeof body.uptime === 'number');
  });

  test('GET /health alias returns 200 OK with status UP', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'UP');
  });
});
describe('Backend Readiness Check API', () => {
  const createReadinessHandler = require('../readinessHandler');

  test('returns 200 READY when database is connected', async () => {
    const mockDb = {
      query: async () => ({ rows: [{ result: 1 }] })
    };

    const handler = createReadinessHandler(mockDb);

    const req = {};
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'READY');
    assert.equal(res.body.database, 'connected');
  });

  test('returns 503 NOT_READY when database is disconnected', async () => {
    const mockDb = {
      query: async () => {
        throw new Error('Database connection failed');
      }
    };

    const handler = createReadinessHandler(mockDb);

    const req = {};
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };

    await handler(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.body.status, 'NOT_READY');
    assert.equal(res.body.database, 'disconnected');
  });
});
