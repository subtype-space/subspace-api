import { logger } from '../../utils/logger.js'
const PRIMARY_API_KEY = process.env.WMATA_PRIMARY_KEY
if (!PRIMARY_API_KEY) {
  logger.error('API key is missing!')
} else {
  console.debug('WMATA API key loaded successfully')
}

type MetroIncidentResponse = {
  Incidents: MetroIncident[]
}

type MetroIncident = {
  DateUpdated: string
  Description: string
  IncidentType: string
  LinesAffected: string
}

type RailPredictionResponse = {
  Trains: RailPrediction[]
}

type RailPrediction = {
  Car: string
  DestinationName: string
  Line: string
  Min: string
}

export async function getStationInfo({ stationCodes }: { stationCodes: string[] }) {
  if (stationCodes.length === 0) {
    logger.debug('No station codes were given')
    return 'Station codes were not supplied.'
  }

  logger.debug('Station codes:', stationCodes)

  const response = await fetch(`https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${stationCodes}`, {
    method: 'GET',
    headers: {
      api_key: PRIMARY_API_KEY!,
    },
  })

  if (!response.ok) {
    return `WMATA API Error: returned ${response.status} with ${response.statusText}`
  }

  const predictionData: RailPredictionResponse = await response.json()
  const railPredictions: RailPrediction[] = predictionData.Trains

  return formatRailPredictionData(railPredictions)
}

export async function getIncidents() {
  logger.debug('Attempting API call to WMATA')
  const response = await fetch('https://api.wmata.com/Incidents.svc/json/Incidents', {
    method: 'GET',
    headers: {
      api_key: PRIMARY_API_KEY!,
    },
  })

  if (!response.ok) {
    return `WMATA API Error: returned ${response.status} with ${response.statusText}`
  }
  const incidentData: MetroIncidentResponse = await response.json()
  // pull into an array of MetroIncidents
  const incidents: MetroIncident[] = incidentData.Incidents

  return formatIncidentsData(incidents)
}

function formatIncidentsData(incidentData: MetroIncident[]): string {
  if (incidentData.length === 0) {
    return 'There are no active incidents at this time'
  }
  // iterate through incidentData array
  const incidentText = incidentData
    .map(
      (incident) =>
        `${incident.LinesAffected}: ${incident.IncidentType} ${incident.Description}\nLast Updated: ${incident.DateUpdated}`
    )
    .join('\n\n')

  return incidentText
}

function formatRailPredictionData(predicitonData: RailPrediction[]): string {
  logger.debug('Attempting API call to WMATA for rail predictions')
  if (predicitonData.length === 0) {
    return 'There is no information for the given station codes, or the metro is closed'
  }

  const predictionText = predicitonData
    .map(
      (prediction) =>
        `${prediction.Line} line\nDestination: ${prediction.DestinationName}\n${prediction.Car} cars long\nNext train arriving in: ${prediction.Min}`
    )
    .join('\n\n')

  return predictionText
}
