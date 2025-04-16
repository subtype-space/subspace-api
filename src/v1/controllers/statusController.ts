import dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

const ACTIVE_VERSION = process.env.API_VERSION || "v1";

const statusController = (request: Request, response: Response) => {
    console.log('Accessed /status')
    response.json({message: "OK!", status: 200, api_version: `${ACTIVE_VERSION}`});
}

export default statusController;