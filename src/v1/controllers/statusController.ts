import { Request, Response } from 'express'
import { logger } from '../../utils/logger.js'

const ACTIVE_VERSION = process.env.API_VERSION || 'v1'

const statusController = (request: Request, response: Response) => {
  logger.debug('Accessed /status')
  response.status(200).json({ api_version: `${ACTIVE_VERSION}` })
}

export default statusController
