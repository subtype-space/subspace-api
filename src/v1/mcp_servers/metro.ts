import { logger } from "../../utils/logger.js"
const PRIMARY_API_KEY = process.env.WMATA_PRIMARY_KEY
if (!PRIMARY_API_KEY) {
  logger.error("API key is missing!")
} else {
  console.debug("WMATA API key loaded successfully")
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

export async function getIncidents() {
  logger.debug("Attempting API call to WMATA")
  logger.debug(`${PRIMARY_API_KEY}`)
  const response = await fetch(
    "https://api.wmata.com/Incidents.svc/json/Incidents",
    {
      method: "GET",
      headers: {
        api_key: PRIMARY_API_KEY!,
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      `WMATA API Error: returned ${response.status} with ${response.statusText}`
    )
  }
  const incidentData: MetroIncidentResponse = await response.json()
  // pull into an array of MetroIncidents
  const incidents: MetroIncident[] = incidentData.Incidents

  return formatIncidentsData(incidents)
}

function formatIncidentsData(incidentData: MetroIncident[]): string {
  if (incidentData.length === 0) {
    return "There are no active incidents at this time"
  }
  // iterate through incidentData array
  const incidentText = incidentData
    .map(
      (incident) =>
        `${incident.LinesAffected}: ${incident.IncidentType} ${incident.Description}\nLast Updated: ${incident.DateUpdated}`
    )
    .join("\n\n")

  return incidentText
}
