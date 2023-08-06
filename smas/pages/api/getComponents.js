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
  const locations = req.body.locations;
  if (condition === "used") {
    if (locations.location1 != "") {
      try {
        const query = `SELECT DISTINCT "Item_name" FROM items where "Used" = true AND "Location_no" IN (SELECT "location_no" from item_location WHERE "location1" = $1 ${
          locations.location2 != "" ? ` AND "location2" = $2 ` : ""
        }${locations.location3 != "" ? ` AND "location3" = $3 ` : ""})`;
        var result;
        if (locations.location1 != "") {
          result = await pool.query(query, [locations.location1]);
        } else if (locations.location2 != "" && locations.location3 == "") {
          result = await pool.query(query, [
            locations.location1,
            locations.location2,
          ]);
        } else if (locations.location3 != "") {
          result = await pool.query(query, [
            locations.location1,
            locations.location2,
            locations.location3,
          ]);
        }
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      try {
        const query = `SELECT DISTINCT "Item_name" FROM items WHERE "Used" = true`;
        const result = await pool.query(query, []);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    }
  } else if (condition === "new") {
    console.log("Called New");
    try {
      const query = `SELECT DISTINCT "Item_name" FROM items where "Used" = false`;
      const result = await pool.query(query, []);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  } else if (condition === "Component") {
    console.log("Called Component");
    const component = req.body.component;
    const itemNavActive = req.body.itemNavActive;
    const usedBoolean = itemNavActive == "used" ? "true" : "false";

    try {
      const query = `SELECT "Serial_key", "StockPageNo", "StockSerialNo", "StockVolumeNo", "StockRegisterEntried" FROM items where "Item_name" = $1 and "Used" = $2 order by "Date" desc`;
      const result = await pool.query(query, [component, usedBoolean]);
      console.log("GetComponents: Response: ", result.rows);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  }
}
