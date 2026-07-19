import type { WebsiteData2a, WebsiteData2b } from '../types'

const API_BASE = 'https://utility.commitswimming.com'
export const SUPER_TEAM_ID = 'g8g7f3rkF8N23vXs4'

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Commit API ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

export function fetchTeamConfig() {
  return getJson<WebsiteData2a>(
    `/website-data-2a?superTeamId=${SUPER_TEAM_ID}`,
  )
}

export function fetchScheduleData() {
  return getJson<WebsiteData2b>(
    `/website-data-2b?superTeamId=${SUPER_TEAM_ID}&includeMeets=false`,
  )
}
