import { json, error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import Database from 'better-sqlite3';
const db = new Database('data/wfh.db')
db.pragma('journal_mode = WAL');

export async function GET({ locals }: RequestEvent) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
  const stmt = db.prepare("select day, month, year from dates where user = ?");
  const result = stmt.all(session.user.email);
 
  return json(result);
}

export async function POST({request, locals}) {
    const session = await locals.getSession()
    if (!session?.user) {
        throw error(401, "You are not signed in.")
    }
	const data = await request.json();
    const stmt = db.prepare("insert into dates values(?,?,?,?)");
    stmt.run(data.day, data.month, data.year, session.user.email);

    const stmt2 = db.prepare("select day, month, year from dates where user = ?");
    const result = stmt2.all(session.user.email);
    
	return json(result);
}