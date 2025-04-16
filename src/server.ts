import dotenv from 'dotenv'
dotenv.config()
import express, { Request, Response, Router } from 'express';

import trmnlRouter from './v1/routers/trmnlRouter.js'
import statusRouter from './v1/routers/statusRouter.js'
import mcpServer from './v1/mcp_servers/weather.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = express();
server.use(express.json());


const PORT = process.env.PORT || 9595;
const ACTIVE_VERSION = process.env.API_VERSION || "v1";
  
server.get('/v1/trmnl', trmnlRouter);
// // catch all/health check
server.get('/health', statusRouter)
server.get('/', statusRouter)


server.listen(PORT, () => {
    console.log("subspace API now listening on PORT:", PORT);
});

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
