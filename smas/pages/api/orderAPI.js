import formidable from "formidable";
import path from "path";
import { Pool } from "pg";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
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

const nextDay = (today) => {
  const date = new Date(today);

  // Add one day to the date
  date.setDate(date.getDate() + 1);

  // Convert the date back to the ISO format
  const nextDayIsoDate = date.toISOString();
  console.log(nextDayIsoDate);
  return nextDayIsoDate;
};

export default async function handler(req, res) {
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
      console.error(err);
      res.status(200).json(-1);
    } else {
      const operation = fields.operation;
      if (operation === "uniqueOrderName") {
        const orderName = fields.orderName;
        console.log(orderName);
        try {
          const query = `SELECT "Order_name" FROM orders WHERE "Order_name" = $1`;
          const result = await pool.query(query, [orderName]);
          const res1 = result.rows[0];
          res.status(200).json(res1);
        } catch (err) {
          console.log(err);
          res.status(200).json(err);
        }
      } else if (operation == "addOrder") {
        const orderDetails = await JSON.parse(fields.orderDetails);
        const orderItems = await JSON.parse(fields.orderItems);
        const noOfQuotations = fields.noOfQuotations;
        const quotationImageNames = fields.quotationImageNames;

        console.log("OrderDetails: ", orderDetails);
        console.log("OrderItems: ", orderItems);
        const imagePaths = [];
        for (var i = 0; i < noOfQuotations; i++) {
          const file = files[`quotationImage${i}`];
          imagePaths.push(file.filepath);
        }
        console.log(imagePaths);

        // Creating Directory
        const directory = path.join(
          process.cwd(),
          "public",
          "uploads",
          "orderQuotations",
          orderDetails.orderName
        );

        fs.mkdir(directory, { recursive: true }, (err) => {
          console.log(err);
        });

        const newImagePaths = [];
        for (var i = 0; i < imagePaths.length; i++) {
          const extension = path.extname(
            files[`quotationImage${i}`].originalFilename
          );

          const storagePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            "orderQuotations",
            orderDetails.orderName,
            `quotation${i}${extension}`
          );
          newImagePaths.push(storagePath);
        }

        console.log(newImagePaths);

        for (var i = 0; i < newImagePaths.length; i++) {
          try {
            fs.writeFile(
              newImagePaths[i],
              fs.readFileSync(imagePaths[i]),
              (err) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log("Finished bill uploading");
                  res.status(200).json("Finished Uploading");
                }
              }
            );
          } catch (err) {
            console.log(err);
            res.status(200).json(-1);
          }
        }

        const itemNames = [];
        const quantities = [];
        const descriptions = [];
        for (var i = 0; i < orderItems.length; i++) {
          itemNames.push(orderItems[i].itemName);
          quantities.push(orderItems[i].quantity);
          descriptions.push(orderItems[i].description);
        }

        const query = `INSERT INTO orders ("Order_name","Items_name", "Quantities", "Date", "Quotations","Description") VALUES ($1,$2,$3,$4,$5,$6)`;
        // console.log(orderDetails.orderDate);
        // const date = new Date(orderDetails.orderDate);

        // // Add one day to the date
        // date.setDate(date.getDate() + 1);

        // // Convert the date back to the ISO format
        // const nextDayIsoDate = date.toISOString();
        // console.log(nextDayIsoDate);

        const params = [
          orderDetails.orderName.toLowerCase(),
          JSON.stringify(itemNames),
          JSON.stringify(quantities),
          nextDay(nextDay(orderDetails.orderDate)),
          //   orderDetails.orderDate,
          JSON.stringify(newImagePaths),
          JSON.stringify(descriptions),
        ];
        pool.query(query, params, (err, result) => {
          if (err) {
            console.log(err);
            res.status(200).json(err);
          }
          console.log("Inserted Successfully");
          res.status(200).json("Inserted Successfully");
        });
      } else if (operation == "fetchOrders") {
        try {
          const query = `SELECT "Order_name", "Date" FROM orders order by "Date" desc`;
          const response = await pool.query(query, []);
          console.log(response.rows);
          res.status(200).json(response.rows);
        } catch (err) {
          console.log(err);
          res.status(200).json(-1);
        }
      } else if (operation == "fetchOrdersByDate") {
        try {
          const fromDate = fields.fromDate
            ? await JSON.parse(fields.fromDate)
            : null;
          const toDate = fields.toDate ? await JSON.parse(fields.toDate) : null;
          console.log("FromDate: ", fromDate);
          console.log("toDate: ", toDate);
          var response;
          var response2 = null;
          if (fromDate && toDate) {
            const query = `SELECT "Order_name", "Date" FROM orders WHERE "Date" BETWEEN $1 AND $2`;
            response = await pool.query(query, [fromDate, nextDay(toDate)]);
          } else if (fromDate) {
            console.log("called here");
            const query = `SELECT "Order_name", "Date" FROM orders WHERE "Date" >= $1`;
            response = await pool.query(query, [fromDate]);
            const query2 = `SELECT "Order_name", "Date" FROM orders WHERE "Date" = $1`;
            response2 = await pool.query(query, [fromDate]);
          } else if (toDate) {
            const query = `SELECT "Order_name", "Date" FROM orders WHERE "Date" <= $1`;
            response = await pool.query(query, [nextDay(nextDay(toDate))]);
            const query2 = `SELECT "Order_name", "Date" FROM orders WHERE "Date" = $1`;
            response2 = await pool.query(query2, [toDate]);
          }
          console.log("RESPONSE: ", response.rows);
          if (response2 == null) {
            res.status(200).json(response.rows);
          }
          res.status(200).json(response.rows, response2.rows);
        } catch (err) {
          console.log(err);
          res.status(200).json(-1);
        }
      } else if (operation === "fetchMyOrder") {
        const orderName = fields.orderName;
        console.log(orderName);
        try {
          const query = `SELECT * FROM orders WHERE "Order_name" = $1`;
          const response = await pool.query(query, [orderName]);
          console.log(response.rows[0]);
          res.status(200).json(response.rows[0]);
        } catch (err) {
          console.log(err);
          res.status(200).json("error");
        }
      } else if (operation === "fetchQuotationImage") {
        const billFilePath = fields.quotation;
        console.log("billFilePath: ", billFilePath);
        const billFileStream = fs.createReadStream(billFilePath);
        res.setHeader(
          "Content-disposition",
          `attachment; filename=${path.basename(billFilePath)}`
        );
        res.setHeader("Content-type", "application/octet-stream");
        billFileStream.pipe(res);
      }
    }
  });
}
