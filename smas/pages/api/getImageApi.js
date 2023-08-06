import pg from "pg";
import fs from "fs";
import formidable from "formidable";
import { createReadStream } from "fs";
import path, { join } from "path";
import { decode } from "base-64";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(req, res) {
  if (req.method === "POST") {
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
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error uploading file");
      } else {
        console.log(fields.serialKey);
        console.log(fields.imageNeeded);
        const imageNeeded = fields.imageNeeded;
        var fetchquery;
        if (imageNeeded == "bill") {
          fetchquery = `SELECT "Bill_Image" from purchase_items where "Serial_key" = $1`;
          const fetchParams = [fields.serialKey];

          pool.query(fetchquery, fetchParams, (err, result) => {
            if (err) {
              console.log(err);
              return;
            } else if (result.rowCount === 0) {
              res.status(404).json({ error: "Image not found" });
              console.log("image not found error");
              console.log(result);
              return;
            }
            //   console.log(result);
            const billFilePath = result.rows[0].Bill_Image;
            console.log("billFilePath: ", billFilePath);
            const billFileStream = fs.createReadStream(billFilePath);
            res.setHeader(
              "Content-disposition",
              `attachment; filename=${path.basename(billFilePath)}`
            );
            res.setHeader("Content-type", "application/octet-stream");
            billFileStream.pipe(res);
          });
        } else if (imageNeeded == "item") {
          fetchquery = `SELECT "Item_Image" from purchase_items where "Serial_key" = $1`;
          const fetchParams = [fields.serialKey];

          pool.query(fetchquery, fetchParams, (err, result) => {
            if (err) {
              console.log(err);
              return;
            } else if (result.rowCount === 0) {
              res.status(404).json({ error: "Image not found" });
              console.log("image not found error");
              console.log(result);
              return;
            }
            //   console.log(result);
            const itemFilePath = result.rows[0].Item_Image;
            console.log(itemFilePath);
            console.log("ItemFilePath: ", itemFilePath);
            const itemFileStream = fs.createReadStream(itemFilePath);
            res.setHeader(
              "Content-disposition",
              `attachment; filename=${path.basename(itemFilePath)}`
            );
            res.setHeader("Content-type", "application/octet-stream");
            itemFileStream.pipe(res);
          });
        } else if (imageNeeded == "installationReport") {
          const fetchParams = [fields.serialKey];

          //   console.log(result);
          const itemFilePathJpg = `D://Sakthi//The_SMAS//smas//public//uploads//installationReports//${fetchParams}.jpg`;
          const itemFilePathJpeg = `D://Sakthi//The_SMAS//smas//public//uploads//installationReports//${fetchParams}.jpeg`;
          const itemFilePathPng = `D://Sakthi//The_SMAS//smas//public//uploads//installationReports//${fetchParams}.png`;
          var itemFileStream;
          if (fs.existsSync(itemFilePathJpg)) {
            itemFileStream = fs.createReadStream(itemFilePathJpg);
            res.setHeader(
              "Content-disposition",
              `attachment; filename=${path.basename(itemFilePathJpg)}`
            );
          } else if (fs.existsSync(itemFilePathJpeg)) {
            itemFileStream = fs.createReadStream(itemFilePathJpeg);
            res.setHeader(
              "Content-disposition",
              `attachment; filename=${path.basename(itemFilePathJpeg)}`
            );
          } else if (fs.existsSync(itemFilePathPng)) {
            itemFileStream = fs.createReadStream(itemFilePathPng);
            res.setHeader(
              "Content-disposition",
              `attachment; filename=${path.basename(itemFilePathPng)}`
            );
          } else {
            res.status(500).json("No File Found");
            return;
          }

          res.setHeader("Content-type", "application/octet-stream");
          itemFileStream.pipe(res);
        }
        //   const fileStream = Buffer.from(data, "base64");
        //   res.setHeader("Content-Type", "image/jpeg");
        //   res.setHeader(
        //     "content-Disposition",
        //     `attachment; filename=${fields.serialKey}.jpg`
        //   );
        //   data.pipe(res);

        // const fileStream = Buffer.from(data, "base64");
        // console.log(fileStream);
        // res.setHeader("Content-Type", "image/jpeg");
        // res.setHeader(
        //   "content-Disposition",
        //   `attachment; filename=${values.serialKey}.jpg`
        // );
        // fileStream.pipe(res);

        // res.status(200).json({ message: "test" });
      }
    });
    //   res.json({ msg: "success" });
  } else {
    res.status(404).json({ error: "Error in request" });
  }
}
