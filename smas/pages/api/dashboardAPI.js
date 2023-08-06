import { Pool } from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const condition = req.body.condition;
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];
  var userDetails;

  try {
    userDetails = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    res.status(200).json("jwtverificationerror");
    return;
  }
  try {
    const userCheckQuery = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2 AND "Password" = $3`;
    const userResponse = await pool.query(userCheckQuery, [
      userDetails.Mobile,
      userDetails.Email,
      userDetails.Password,
    ]);
    if (userResponse.rowCount == 0) {
      res.status(200).json("no user");
      return;
    } else {
      if (condition === "fetchUsedCount") {
        const fetchUsedQuery = `SELECT count("Serial_key") FROM items WHERE "Used" = true`;
        const usedResponse = await pool.query(fetchUsedQuery);
        res.status(200).json(usedResponse.rows[0].count);
      } else if (condition === "fetchUnUsedCount") {
        const fetchUsedQuery = `SELECT count("Serial_key") FROM items WHERE "Used" = false`;
        const unUsedResponse = await pool.query(fetchUsedQuery);
        res.status(200).json(unUsedResponse.rows[0].count);
      } else if (condition === "fetchNotWorkingCount") {
        const fetchQuery = `SELECT count("Serial_key") FROM items WHERE "Used" = false AND "Condition" = 'Not Working'`;
        const response = await pool.query(fetchQuery, []);
        res.status(200).json(response.rows[0].count);
      } else if (condition === "fetchItemsCountOnDate") {
        const dateRange = req.body.dateRange;
        const dateArray = dateRange.split("-");
        // const query = `SELECT count("Serial_key") FROM purchase_items WHERE "Date" BETWEEN '${dateArray[0]}-04-01' AND '${dateArray[1]}-03-31'`;
        const query = `
    WITH years AS (
      SELECT generate_series(${dateArray[0]} - 5, ${dateArray[0]} - 1) AS year
  )
  SELECT EXTRACT(YEAR FROM "Date") AS year, COUNT(*) AS count
  FROM purchase_items
  WHERE ("Date" >= to_date('${dateArray[0]}-04-01', 'YYYY-MM-DD') 
    AND "Date" < to_date('${dateArray[0] + 1}-04-01', 'YYYY-MM-DD'))
    OR ((EXTRACT(YEAR FROM "Date"), EXTRACT(MONTH FROM "Date")) >= (SELECT year, 4 FROM years WHERE year = EXTRACT(YEAR FROM "Date"))
    AND (EXTRACT(YEAR FROM "Date"), EXTRACT(MONTH FROM "Date")) < (SELECT year + 1, 4 FROM years WHERE year = EXTRACT(YEAR FROM "Date")))
  GROUP BY year
  ORDER BY year DESC;
`;
        const response = await pool.query(query, []);
        res.status(200).json(response.rows);
      } else if (condition === "fetchItemsWithCount") {
        const dateRange = req.body.dateRange;
        const dateArray = dateRange.split("-");
        const fromDate = dateArray[0];
        const toDate = dateArray[1];
        const query = `SELECT "Item_name", count("Item_name") from items
          WHERE "Date" >= '${fromDate}-04-01' AND "Date" <= '${toDate}-03-31'
          GROUP BY "Item_name"`;
        const response = await pool.query(query, []);
        res.status(200).json(response.rows);
        // res.status(200).json(1);
      } else if (condition === "fetchExpenses") {
        const dateRange = req.body.dateRange;
        const dateArray = dateRange.split("-");
        const fromDate = dateArray[0];
        const toDate = dateArray[1];
        const query = `WITH years AS (
          SELECT generate_series(${dateArray[0]} - 5, ${
          dateArray[0]
        } - 1) AS year
      )
      SELECT EXTRACT(YEAR FROM "Date") AS year, sum("TotalRate") as Sum
      FROM purchase_items
      WHERE ("Date" >= to_date('${dateArray[0]}-04-01', 'YYYY-MM-DD') 
        AND "Date" < to_date('${dateArray[0] + 1}-04-01', 'YYYY-MM-DD'))
        OR ((EXTRACT(YEAR FROM "Date"), EXTRACT(MONTH FROM "Date")) >= (SELECT year, 4 FROM years WHERE year = EXTRACT(YEAR FROM "Date"))
        AND (EXTRACT(YEAR FROM "Date"), EXTRACT(MONTH FROM "Date")) < (SELECT year + 1, 4 FROM years WHERE year = EXTRACT(YEAR FROM "Date")))
      GROUP BY year
      ORDER BY year DESC;`;
        const response = await pool.query(query, []);
        res.status(200).json(response.rows);
      }
    }
  } catch (err) {
    console.log(err);
    res.status(200).json(-1);
  }
}
