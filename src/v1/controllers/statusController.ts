import dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

const ACTIVE_VERSION = process.env.API_VERSION || "v1";

const statusController = (request: Request, response: Response) => {
    console.log('Accessed /status')
    response.status(200).json({api_version: `${ACTIVE_VERSION}`})
}

export default statusController;