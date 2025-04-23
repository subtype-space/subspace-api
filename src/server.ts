import "./utils/env.js" // I hate how I have to do this but whatever. Stupid shim.
import { logger } from "./utils/logger.js"
import express, { Request, Response } from "express"
import trmnlRouter from "./v1/routers/trmnlRouter.js"
import statusRouter from "./v1/routers/statusRouter.js"

// MCP import shenanigans
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import { getAlerts, getForecast } from "./v1/mcp_servers/weather.js"
import { z } from "zod"
import { getStockDetails } from "./v1/mcp_servers/stocks.js"

import { getIncidents } from "./v1/mcp_servers/metro.js"
import { getStationInfo } from "./v1/mcp_servers/metro.js"
logger.info("Initializing MCP server...")
const mcpServer = new McpServer({
  name: "subspace-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
})

logger.debug(mcpServer)
const server = express()
const PORT = process.env.PORT || 9595
const ACTIVE_VERSION = process.env.API_VERSION || "v1"
// Register and enable model context protocol tools
const transports: { [sessionId: string]: SSEServerTransport } = {}
logger.info("Registering tools with MCP server...")
// Register weather tools
mcpServer.tool(
  "get-alerts",
  "Retrieves active weather alerts for a specific US state (e.g. tornado watches, heat advisories).",
  {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
  },
  async ({ state }) => {
    const alertsText = await getAlerts({ state })
    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    }
  }
)

mcpServer.tool(
  "get-forecast",
  "Provides a detailed 7-day weather forecast based on latitude and longitude.",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .describe("Longitude of the location"),
  },
  async ({ latitude, longitude }) => {
    const forecastText = await getForecast({ latitude, longitude })
    return {
      content: [
        {
          type: "text",
          text: forecastText,
        },
      ],
    }
  }
)

mcpServer.tool(
  "get-stock",
  "Provides stock information, including news titles for sentiment analysis (price, name, percent change, news) for one or more stocks. Ticker names must be provided in all caps, with no special characters.",
  {
    stocks: z
      .array(
        z
          .string()
          .min(1)
          .max(5)
          .regex(
            /^[A-Z]+$/,
            "Stock tickers must be uppercase letters and no special characters"
          )
          .describe("A valid stock ticker symbol")
      )
      .min(1)
      .max(50)
      .describe("A list of one or more stock ticker symbols (e.g. AAPL, AMD"),
  },
  async ({ stocks }) => {
    const stockText = await getStockDetails({ stocks })
    return {
      content: [
        {
          type: "text",
          text: stockText,
        },
      ],
    }
  }
)

mcpServer.tool(
  "get-wmata-incidents",
  "Returns any active alerts posted by WMATA (metro). Can sometimes be empty.",
  {},
  async () => {
    const alertsText = await getIncidents()
    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    }
  }
)

mcpServer.tool(
  "get-wmata-station-info",
  "Returns next train arrival for one or more stations. Will return an empty set of results when no predictions are available if a station is closed.\
  Some stations have two platforms, like Metro Center, which requires passing in both station codes. For trains with no passengers, the DestinationName will be 'No Passenger'\
  Before close, DestinationName will be 'LastTrain' if they are the last train in that line",
  {
    stationCodes: z
      .array(z.string().min(2).max(3))
      .describe("An array of station codes"),
  },
  async ({ stationCodes }) => {
    const predictionText = await getStationInfo({ stationCodes })
    logger.debug("STATION INFO RESPONSE:", predictionText)
    return {
      content: [
        {
          type: "text",
          text: predictionText,
        },
      ],
    }
  }
)

// Discovery endpoint - req is never used
server.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res)
  transports[transport.sessionId] = transport
  console.debug("New session created:", transport.sessionId)
  res.on("close", () => {
    logger.debug("Closing connection")
    delete transports[transport.sessionId]
  })
  await mcpServer.connect(transport)
})

// MCP Handler
server.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string

  if (typeof sessionId != "string") {
    console.error("Bad sessionId", sessionId)
    res.status(400).send({ messages: "Bad sessionId" })
  }

  const transport = transports[sessionId]
  if (transport) {
    console.debug(`${transport.sessionId} has an active session`)
    await transport.handlePostMessage(req, res, req.body) // don't remove req.body otherwise MCP inspector will panik
  } else {
    res.status(400).send(`No session was found for ${sessionId}`)
  }
})

logger.info("Initializing routes...")
// Declare regular REST API routing
server.use("/", express.json(), statusRouter)
server.use("/v1/trmnl", express.json(), trmnlRouter)
server.use("/health", express.json(), statusRouter)

server.listen(PORT, () => {
  logger.info(`Using log level: ${process.env.LOG_LEVEL || "info"}`)
  logger.info("Using API version:", ACTIVE_VERSION)
  logger.debug("MCP Server debug:", mcpServer)
  logger.info("subspace API now listening on PORT:", PORT)
})
