function createReadinessHandler(db) {
  return async (req, res) => {
    try {
      await db.query('SELECT 1');

      res.status(200).json({
        status: 'READY',
        database: 'connected'
      });
    } catch (error) {
      res.status(503).json({
        status: 'NOT_READY',
        database: 'disconnected'
      });
    }
  };
}

module.exports = createReadinessHandler;
