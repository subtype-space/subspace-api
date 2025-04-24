import './utils/env.js' // I hate how I have to do this but whatever. Stupid shim.
import { logger } from './utils/logger.js'
import express, { Request, Response } from 'express'
import trmnlRouter from './v1/routers/trmnlRouter.js'
import statusRouter from './v1/routers/statusRouter.js'

// MCP import shenanigans
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { registerTools } from './v1/mcp/registerTools.js'
logger.info('Initializing MCP server...')
const mcpServer = new McpServer({
  name: 'subspace-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
})

logger.debug(mcpServer)
const server = express()
const PORT = process.env.PORT || 9595
const ACTIVE_VERSION = process.env.API_VERSION || 'v1'
// Register and enable model context protocol tools
const transports: { [sessionId: string]: SSEServerTransport } = {}


logger.info('Registering tools with MCP server...')
registerTools(mcpServer)


// Discovery endpoint - req is never used
server.get('/sse', async (_: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res)
  transports[transport.sessionId] = transport
  console.debug('New session created:', transport.sessionId)
  res.on('close', () => {
    logger.debug('Closing connection')
    delete transports[transport.sessionId]
  })
  await mcpServer.connect(transport)
})

// MCP Handler
server.post('/messages', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string

  if (typeof sessionId != 'string') {
    console.error('Bad sessionId', sessionId)
    res.status(400).send({ messages: 'Bad sessionId' })
  }

  const transport = transports[sessionId]
  if (transport) {
    console.debug(`${transport.sessionId} has an active session`)
    await transport.handlePostMessage(req, res, req.body) // don't remove req.body otherwise MCP inspector will panik
  } else {
    res.status(400).send(`No session was found for ${sessionId}`)
  }
})

logger.info('Initializing routes...')
// Declare regular REST API routing
server.use('/', express.json(), statusRouter)
server.use('/v1/trmnl', express.json(), trmnlRouter)
server.use('/health', express.json(), statusRouter)

server.listen(PORT, () => {
  logger.info(`Using log level: ${process.env.LOG_LEVEL || 'info'}`)
  logger.info('Using API version:', ACTIVE_VERSION)
  logger.debug('MCP Server debug:', mcpServer)
  logger.info('subspace API now listening on PORT:', PORT)
})
