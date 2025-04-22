import yahooFinance from 'yahoo-finance2'
import { logger } from '../../utils/logger.js'

type StockQuote = {
  name: string
  price: string | number // in case it's unknown
  changePercent: string | number
}

type StockQuoteDetailed = {
  name: string
  price: string | number
  changePercent: string | number
  newsSentiment: string[]
}

export async function getStocks({ stocks }: { stocks: string[] }) {
  if (stocks === null || stocks.length === 0) {
    logger.debug("No stocks found in parameter")
    return "No stocks were detected or mentioned. Ask the user to verify if the stock is real or to double check the stock ticker name"
  }
  logger.debug("Detected stocks:", stocks)

  const stockData: StockQuote[] = []
  for (const ticker of stocks) {
    console.debug("Attempting to retrieve quote information for", ticker)
    const quote = await yahooFinance.quote(ticker)
    const { regularMarketPrice, shortName, symbol, regularMarketChangePercent } = quote;

    stockData.push({
      name: shortName ?? symbol,
      price: regularMarketPrice ?? "Delayed quote or unknown stock",
      changePercent: regularMarketChangePercent != null ? Number(regularMarketChangePercent.toFixed(2)) : "Change data unavailable"
    })
  }

  return formatStockData(stockData)
}

export async function getStockDetails({ stocks }: { stocks: string[] }) {
  if (stocks === null || stocks.length === 0) {
    logger.debug("No stocks found in parameter")
    return "Stocks was not detected mentioned. Ask the user to verify if the stock is real or to double check the stock ticker name"
  }
  logger.debug("Detected stocks:", stocks)

  const stockData: StockQuoteDetailed[] = []

  for (const ticker of stocks) {
    console.debug("Attempting to search stock info on", ticker)

    const detailedQuote = await yahooFinance.search(ticker)
    const { news } = detailedQuote
  
    const quote = await yahooFinance.quote(ticker)
    const { regularMarketPrice, regularMarketChangePercent, shortName, symbol } = quote;

    
    stockData.push({
      name: shortName ?? symbol,
      price: regularMarketPrice ?? "Delayed unknown stock",
      changePercent: regularMarketChangePercent != null ? Number(regularMarketChangePercent.toFixed(2)) : "Change data unavailable",
      newsSentiment: news.map((item) => item.title)
    })
  }
  return formatDetailedStockData(stockData)
  
}

function formatStockData(stockData: StockQuote[]): string {
  return stockData
    .map(({ name, price, changePercent }) => {
      const change = typeof changePercent === "number" ? `${changePercent.toFixed(2)}%` : changePercent //default is text!

      return `${name}: $${price} (${change})`
    }).join("\n") //new line for every stock returned 
}

function formatDetailedStockData(stockData: StockQuoteDetailed[]): string {
  return stockData
    .map(( { name, price, changePercent, newsSentiment }) => {
      const change = typeof changePercent === "number" ? `${changePercent.toFixed(2)}%` : changePercent
      const newsSection = newsSentiment.length ? `Top news:\n- ${newsSentiment.slice(0,3).join("\n- ")}` : "No recent news found."

      return `${name}\nPrice: $${price} (${change})\n${newsSection}`
    }).join("\n\n")
}