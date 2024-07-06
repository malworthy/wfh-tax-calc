import { json, error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import {
  MONGO_CS,
  MONGO_DB,
 } from '$env/static/private';
import { MongoClient } from "mongodb";
const client = new MongoClient(MONGO_CS);


export async function GET({ url, locals }: RequestEvent) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
  const fyear = Number(url.searchParams.get('fyear'));
  const database = client.db(MONGO_DB);
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
  const database = client.db(MONGO_DB);
  const dates = database.collection('dates');

	const data = await request.json();

  for(const row of data) {
    const insertDoc = {
      day: Number(row.day),
      month: Number(row.month),
      year: Number(row.year),
      fyear: Number(row.fyear),
      //status: Number(row.status),
      user: session.user.email
    };

    const document = { 
      $set: {
        status: Number(row.status)
      },
      $setOnInsert: insertDoc
    };

    console.log(insertDoc);

    const filter = {
      day: Number(row.day),
      month: Number(row.month),
      year: Number(row.year),
      //fyear: Number(row.fyear),
      user: session.user.email
    };
    await dates.updateOne(filter, document, {upsert: true});
  }  
	return json({success: true});
}

