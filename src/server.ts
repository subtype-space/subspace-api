import './utils/env.js' // I hate how I have to do this but whatever. Stupid shim.
import { logger } from './utils/logger.js'
import express, { NextFunction, Request, Response } from 'express'
import trmnlRouter from './v1/routers/trmnlRouter.js'
import statusRouter from './v1/routers/statusRouter.js'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

// MCP import shenanigans
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { registerTools } from './v1/mcp/registerTools.js'
import { logIncomingAuth, authRequired, authOptional } from './utils/auth.js'

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

// Discovery endpoint
server.get('/sse', logIncomingAuth, authRequired, async (req: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res)
  transports[transport.sessionId] = transport
  logger.info('New MCP session created:', transport.sessionId)
  res.on('close', () => {
    logger.info('Closing session', transports[transport.sessionId])
    delete transports[transport.sessionId]
  })
  await mcpServer.connect(transport)
})

// MCP Handler
server.post('/messages', logIncomingAuth, authRequired, async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string

  if (typeof sessionId != 'string') {
    logger.error('Bad sessionId', sessionId)
    res.status(400).send({ message: 'Bad sessionId' })
  }

  const transport = transports[sessionId]
  if (transport) {
    logger.info(`${transport.sessionId} has an active session`)
    await transport.handlePostMessage(req, res, req.body) // don't remove req.body otherwise MCP inspector will panik
  } else {
    res.status(400).send(`No session was found for ${sessionId}`)
  }
})

logger.info('Setting up middleware...')
// Set up rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 })

server.use(helmet())
server.use(limiter)

logger.info('Initializing routes...')
// Declare regular REST API routing
server.use('/', authOptional, express.json(), statusRouter)
//server.use('/v1/trmnl', express.json(), trmnlRouter) disable this route because it's just not active right now
server.use('/health', authOptional, express.json(), statusRouter)

// reverse proxy
server.set('trust proxy', 1)

server.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  if (err.name === 'UnauthorizedError') {
    logger.warn('JWT failed authentication')
    res.status(401).send({ message: 'Unauthorized' })
  } else if (err.code === 'credentials_required') {
    logger.warn('No token provided')
    res.status(401).json({ message: 'No token provided' })
  } else {
    next(err)
  }
})

server.listen(PORT, () => {
  logger.info(`Using log level: ${process.env.LOG_LEVEL || 'info'}`)
  logger.info('Using API version:', ACTIVE_VERSION)
  logger.debug('MCP Server debug:', mcpServer)
  logger.info('subspace API now listening on PORT:', PORT)
})
