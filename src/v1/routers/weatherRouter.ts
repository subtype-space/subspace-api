import express from 'express';
import mcpServer from '../mcp_servers/weather.js'; // this is your MCP setup

const router = express.Router();

router.post('/get-forecast', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'latitude and longitude must be numbers' });
  }

  try {
    const result = await mcpServer.invokeTool('get-forecast', { latitude, longitude });
    res.json(result);
  } catch (err) {
    console.error('Error invoking weather tool:', err);
    res.status(500).json({ error: 'Tool execution failed' });
  }
});

router.post('/get-alerts', async (req, res) => {
  const { state } = req.body;

  if (typeof state !== 'string' || state.length !== 2) {
    return res.status(400).json({ error: 'state must be a two-letter code' });
  }

  try {
    const result = await mcpServer.invokeTool('get-alerts', { state });
    res.json(result);
  } catch (err) {
    console.error('Error invoking alerts tool:', err);
    res.status(500).json({ error: 'Tool execution failed' });
  }
});

export default router;
