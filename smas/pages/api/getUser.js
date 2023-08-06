import { auth } from "@/components/Firebase";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const condition = req.body.condition;
  console.log(condition);
  if (condition == "getUser") {
    const email = req.body.email;
    try {
      const userRecord = auth.getUserByEmail(email);
      res.status(200).json(userRecord);
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  }
}
