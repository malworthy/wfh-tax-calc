import { json, error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import { WOVG_API_KEY } from "$env/static/private";

export async function GET({ url, locals }: RequestEvent) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
  const fyear = Number(url.searchParams.get('fyear'));
  const start = `${fyear}-07-01`;
  const end = `${fyear+1}-06-30`;
  const wovgUrl = `https://wovg-community.gateway.prod.api.vic.gov.au/vicgov/v2.0/dates?type=PUBLIC_HOLIDAY&from_date=${start}&to_date=${end}&format=json`;
  
  const response = await fetch(wovgUrl, {
    headers: {
      "apiKey": WOVG_API_KEY,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  //console.log('Response from wogvapi');
  const result = await response.json();
  const holidays = []
  for (const d of result.dates) {
    const year = d.date.slice(0,4);
    const month = d.date.slice(5,7);
    const day= d.date.slice(8,10);
    holidays.push({day:Number(day), month:Number(month), year:Number(year)});
  }
  
  //console.log(holidays);
  return json(holidays);

}

