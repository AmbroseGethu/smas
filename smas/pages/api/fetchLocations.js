import { Pool } from "pg";
import dotenv from "dotenv";

import jwt from "jsonwebtoken";

dotenv.config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const location = req.body.location;
  const serialKey = req.body.serialKey;
  const operation = req.body.operation;
  const authHeader = req.headers.authorization;

  var token = authHeader && authHeader.split(" ")[1];
  var formDetails;
  try {
    formDetails = jwt.verify(token, process.env.JWT_SECRET);
    const userCheckQuery = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2`;
    const userCheckResponse = await pool.query(userCheckQuery, [
      formDetails.Mobile,
      formDetails.Email,
    ]);
    if (userCheckResponse.rowCount == 0) {
      res.status(200).json(-2);
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(200).json(-2);
    return;
  }
  console.log(location);
  console.log(serialKey);
  if (location === "base") {
    const formDetails = req.body.formDetails;
    const page = req.body.page;
    if (page === "addLocation") {
      try {
        const query = `SELECT DISTINCT "location1" FROM item_location WHERE "location1" <> ''`;
        const result = await pool.query(query, []);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(200).json(err);
      }
    } else {
      try {
        const query = `SELECT DISTINCT "location1" FROM item_location WHERE "location1" <> '' ${
          formDetails.component != ""
            ? ` AND "location_no" IN (SELECT "Location_no" FROM items WHERE "Item_name" = $1)`
            : ""
        }`;
        var result;
        if (formDetails.component == "") {
          result = await pool.query(query, []);
        } else {
          result = await pool.query(query, [formDetails.component]);
        }
        res.status(200).json(result.rows);
      } catch (err) {
        console.log("The Error is from Here: ", err);
        res.status(500).send("Internal Server Error");
      }
    }
  } else if (operation == "addlocation1") {
    const location1 = req.body.location1;
    try {
      const query = `INSERT INTO item_location (location1) VALUES ($1) RETURNING *`;
      const result = await pool.query(query, [location1]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json("Field Already Added");
    }
  } else if (operation == "addlocation2") {
    const location1 = req.body.location1;
    const location2 = req.body.location2;
    try {
      const query = `INSERT INTO item_location (location1, location2) VALUES ($1, $2) RETURNING *`;
      const result = await pool.query(query, [location1, location2]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json("Field Already Added");
    }
  } else if (operation == "addlocation3") {
    const locationDetails = req.body.locations;
    const location3 = req.body.location3;
    console.log("locationDetails: ", locationDetails);
    try {
      const query = `INSERT INTO item_location (location1, location2, location3) VALUES ($1, $2, $3) RETURNING *`;
      const result = await pool.query(query, [
        locationDetails.location1,
        locationDetails.location2,
        location3,
      ]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json("Field Already Added");
    }
  } else if (operation == "deleteLocation1") {
    const location1 = req.body.location1;
    console.log("Location: ", location1);
    // try {
    //   const query = `SELECT count("Serial_key") FROM items WHERE "Location_no" = (SELECT "Location_no" FROM item_location )`;
    // } catch (err) {
    //   console.log(err);
    //   res.status(200).json(err);
    // }
    try {
      const query = `DELETE FROM item_location WHERE location1 = $1 AND serial_key ISNULL`;
      const result = await pool.query(query, [location1]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json("Location is not empty");
    }
  } else if (operation == "deleteLocation2") {
    const location1 = req.body.location1;
    const locations = req.body.locations;
    var count = 0;
    try {
      const query = `SELECT count("Serial_key") FROM items WHERE "Location_no" = (SELECT Location_no from item_location WHERE location1 = $1 AND location2 = $2)`;
      const response = await pool.query(query, [
        locations.location1,
        locations.location2,
      ]);
      console.log("Count: ", response.rows[0].count);
      count = response.rows[0].count;
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
    if (count > 0) {
      res.status(200).json("Field exists");
    } else {
      try {
        const query = `DELETE FROM item_location WHERE location2 = $1 AND location1 = $2 AND "serial_key" ISNULL RETURNING *`;
        const result = await pool.query(query, [
          locations.location2,
          locations.location1,
        ]);
        console.log("Deletion response: ", result.data);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(200).json("Location is not empty");
      }
    }
  } else if (operation == "deleteLocation3") {
    const location2 = req.body.location1;
    const locations = req.body.locations;
    try {
      const query = `DELETE FROM item_location WHERE location2 = $1 AND location1 = $2 AND location3 = $3 AND "serial_key" ISNULL`;
      const result = await pool.query(query, [
        locations.location2,
        locations.location1,
        locations.location3,
      ]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json("Location is not empty");
    }
  } else if (operation == "fetchLocation2") {
    const locationDetails = req.body.locations;
    const component = req.body.component;
    const page = req.body.page;
    if (page === "addLocation") {
      try {
        const query = `SELECT DISTINCT "location2" FROM item_location WHERE location1 = $1 AND location2 <> ''`;
        const result = await pool.query(query, [locationDetails.location1]);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    } else {
      try {
        const query = `SELECT DISTINCT "location2" FROM item_location WHERE location1 = $1 AND location2 <> '' ${
          component != ""
            ? ` AND "location_no" IN (SELECT "Location_no" FROM items WHERE "Item_name" = $2)`
            : ""
        }`;
        var result;
        if (component == "") {
          result = await pool.query(query, [locationDetails.location1]);
        } else {
          result = await pool.query(query, [
            locationDetails.location1,
            component,
          ]);
        }
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(200).json(err);
      }
    }
  } else if (operation == "fetchLocation3") {
    const locationDetails = req.body.locations;
    const component = req.body.component;
    const page = req.body.page;
    if (page === "addLocation") {
      try {
        const query = `SELECT DISTINCT "location3" FROM item_location WHERE location1 = $1 and location2 = $2 and location3 <> ''`;
        const result = await pool.query(query, [
          locationDetails.location1,
          locationDetails.location2,
        ]);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    } else {
      try {
        const query = `SELECT DISTINCT "location3" FROM item_location WHERE location1 = $1 and location2  = $2 and location3 <> '' ${
          component != ""
            ? ` AND "location_no" IN (SELECT "Location_no" FROM items WHERE "Item_name" = $3)`
            : ""
        }`;
        var result;
        if (component == "") {
          result = await pool.query(query, [
            locationDetails.location1,
            locationDetails.location2,
          ]);
        } else {
          result = await pool.query(query, [
            locationDetails.location1,
            locationDetails.location2,
            component,
          ]);
        }
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(200).json(err);
      }
    }
  } else if (operation == "addItemLocation") {
    console.log("Called AddItemLocation");
    const locationDetails = req.body.locations;
    const serialKey = req.body.serialKey;
    const user = req.body.user;
    console.log("locationDetails:  ", locationDetails);
    var logData = {
      operation: "updateLocation",
      user: user,
      dateOfOperation: new Date().toDateString(),
      location1: locationDetails.location1,
      location2: locationDetails.location2,
      location3: locationDetails.location3,
    };
    try {
      const query = `SELECT "location_no" FROM item_location WHERE location1 = $1 AND location2 = $2 ${
        locationDetails.location3.length > 0 ? `AND location3 = $3` : ``
      }`;
      const logFetchQuery = `SELECT "Logs" FROM items WHERE "Serial_key" = $1`;
      const logArrayResponse = await pool.query(logFetchQuery, [serialKey]);
      var logArray = await JSON.parse(logArrayResponse.rows[0].Logs);
      logArray.push(logData);
      logArray = JSON.stringify(logArray);
      var result;
      if (locationDetails.location3 == "") {
        result = await pool.query(query, [
          locationDetails.location1,
          locationDetails.location2,
        ]);
      } else {
        result = await pool.query(query, [
          locationDetails.location1,
          locationDetails.location2,
          locationDetails.location3,
        ]);
      }
      const location_no = result.rows[0].location_no;
      const getSerialKeys = `SELECT "serial_key" FROM "item_location" WHERE "location_no" = $1`;
      const serialKeyResponse = await pool.query(getSerialKeys, [location_no]);
      var serialKeyString = serialKeyResponse.rows[0].serial_key;
      console.log("Serial Key String: ", serialKeyString);
      if (serialKeyString == null) {
        serialKeyString = serialKey.toString();
      } else {
        var stringArray = serialKeyString.split(",");
        serialKeyString = serialKeyString + "," + serialKey.toString();
      }

      console.log("New Serial Key String: ", serialKeyString);
      const updateLocationSerialKey = `UPDATE item_location SET "serial_key" = $1 WHERE "location_no" = $2`;
      const locationSerialKeyResponse = await pool.query(
        updateLocationSerialKey,
        [serialKeyString, location_no]
      );
      console.log("location_no: ", location_no);
      try {
        const query = `UPDATE items SET "Location_no" = $1, "Used" = true, "Condition" = 'Working', "Logs" = $3 WHERE "Serial_key" = $2 RETURNING *`;
        const result2 = await pool.query(query, [
          location_no,
          serialKey,
          logArray,
        ]);

        res.status(200).json(result2);
      } catch (err2) {
        console.log(err2);
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  } else if (operation == "removeLocation") {
    const { serialKey, condition, accessingUser } = req.body;
    try {
      const getLog = `SELECT "Logs" FROM items WHERE "Serial_key" = $1`;
      const logResponse = await pool.query(getLog, [serialKey]);
      var myLog = await JSON.parse(logResponse.rows[0].Logs);
      console.log("MYLOG: ", myLog);
      myLog.push({
        operation: "updateWorking",
        user: accessingUser,
        dateOfOperation: new Date().toDateString(),
        updatedWorking: condition,
      });
      console.log("AFTER UPDATING: ", myLog);
      const query = `UPDATE items SET "Used" = false, "Condition" = $1, "Location_no" = null, "Logs" = $3 WHERE "Serial_key" = $2`;
      const result = await pool.query(query, [
        condition,
        serialKey,
        JSON.stringify(myLog),
      ]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  } else if (operation == "fetchLocation") {
    const { serialKey } = req.body;
    try {
      const query = `SELECT * FROM item_location WHERE Location_no = (SELECT "Location_no" from items WHERE "Serial_key" = $1)`;
      const result = await pool.query(query, [serialKey]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  }
}
