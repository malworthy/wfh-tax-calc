import { json, error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import Database from 'better-sqlite3';
const db = new Database('data/wfh.db')
db.pragma('journal_mode = WAL');

export async function GET({ url, locals }: RequestEvent) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
  // create schema
  try {
    const stmt = db.prepare("create table dates(day integer, month integer, year integer, user text, fyear integer)");
    stmt.run();
  } catch {}

  const fyear = url.searchParams.get('fyear');
  const stmt = db.prepare("select day, month, year from dates where user = ? and fyear = ?");
  const result = stmt.all(session.user.email, fyear);
 
  return json(result);
}

export async function POST({request, locals}) {
  const session = await locals.getSession()
  if (!session?.user) {
    throw error(401, "You are not signed in.")
  }
	const data = await request.json();

  const stmt1 = db.prepare("select count(*) as c from dates where day=? and month=? and year=? and user=?");
  const row:any = stmt1.get(data.day, data.month, data.year, session.user.email);

  const sql = row.c > 0 ? "delete from dates where day=? and month=? and year=? and user=? and fyear = ?" 
  : "insert into dates values(?,?,?,?,?)";

  const stmt2 = db.prepare(sql);
  stmt2.run(data.day, data.month, data.year, session.user.email, data.fyear);

  const stmt3 = db.prepare("select day, month, year from dates where user = ? and fyear = ?");
  const result = stmt3.all(session.user.email, data.fyear);
  
	return json(result);
}

