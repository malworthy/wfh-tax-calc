import { json, error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import {
  MONGO_CS,
 } from '$env/static/private';
import { MongoClient } from "mongodb";
const client = new MongoClient(MONGO_CS);


export async function GET({ url, locals }: RequestEvent) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
  const fyear = Number(url.searchParams.get('fyear'));
  const database = client.db('myFirstDatabase');
  const dates = database.collection('dates');
  const result = dates.find( {user: session.user.email, fyear: fyear });
  const arr = await result.toArray();
  //console.log(arr);
 
  return json(arr);
}

export async function POST({request, locals }) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
	const data = await request.json();

  const document = {
    day: Number(data.day),
    month: Number(data.month),
    year: Number(data.year),
    fyear: Number(data.fyear),
    user: session.user.email
  };
  const database = client.db('myFirstDatabase');
  const dates = database.collection('dates');

  const doc = await dates.findOne(document);
  if (!doc)
    await dates.insertOne(document);
  else
    await dates.deleteOne(document);

  const result = dates.find( {user: session.user.email, fyear: Number(data.fyear) });
  const arr = await result.toArray();
  
	return json(arr);
}

