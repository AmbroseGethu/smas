import formidable from "formidable";
import fs from "fs";
import path from "path";
const pg = require("pg");
import jwt from "jsonwebtoken";

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
        console.error(err);
        res.status(500).send("Error uploading file");
      } else {
        if (fields.operation === "checkInvoice") {
          console.log("Fields.invoiceNo: ", fields.invoiceNo);
          const query = `SELECT "Bill_Image" FROM purchase_items WHERE "Invoice_no" = $1`;
          const response = await pool.query(query, [fields.invoiceNo]);
          console.log(response.rows[0]);
          res.status(200).json(response.rows[0]);
        } else {
          // const filePath = files.BillImage.filepath;
          const values = await JSON.parse(fields.values);
          const accessingUser = fields.user;
          var duplicateCheck;
          try {
            const query = `SELECT "Serial_key" FROM items WHERE "Serial_key" = $1`;
            duplicateCheck = await pool.query(query, [values.serialKey]);
          } catch (err) {
            console.log(err);
            res.status(500).send(err);
            return;
          }
          if (duplicateCheck.rowCount == 0) {
            const itemExtension = path.extname(
              files.itemImage.originalFilename
            );
            // New try to store image in server fs

            const itemStoragePath = path.join(
              process.cwd(),
              "public",
              "uploads",
              "items",
              `${values.invoiceNo}${itemExtension}`
            );
            var billStoragePath;
            if (values.duplicateInvoice == false) {
              const billExtension = path.extname(
                files.billImage.originalFilename
              );
              billStoragePath = path.join(
                process.cwd(),
                "public",
                "uploads",
                "bills",
                `${values.invoiceNo}${billExtension}`
              );
              const billImageFile = files.billImage;

              try {
                fs.writeFile(
                  billStoragePath,
                  fs.readFileSync(billImageFile.filepath),
                  (err) => {
                    if (err) {
                      console.error(err);
                      res.status(500).send("Error uploading file");
                    } else {
                      console.log("Finished bill uploading");
                    }
                  }
                );
              } catch (err) {
                console.log(err);
                res.status(200).json(err);
              }
            } else if (values.duplicateInvoice == true) {
              console.log("Called Duplicate");
              console.log(values.duplicateInvoice);
              console.log(fields.billImage);
              billStoragePath = fields.billImage;
            }

            const itemImageFile = files.itemImage;
            try {
              fs.writeFile(
                itemStoragePath,
                fs.readFileSync(itemImageFile.filepath),
                (err) => {
                  if (err) {
                    console.error(err);
                    res.status(500).send("Error uploading file");
                  } else {
                    console.log("Finished item uploading");
                  }
                }
              );
              const query = `INSERT INTO purchase_items ("Serial_key","Item_name","Invoice_no","Date","Description","Quantity","RatePerQuantity","Rate","Tax","TaxRate","TotalRate","Warranty","Reference_no","PreOrdered","Bill_Image","Item_Image") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`;

              const params = [
                values.serialKey,
                values.itemName,
                values.invoiceNo,
                values.invoiceDate,
                values.description,
                values.quantity,
                values.ratePerQuantity,
                values.rate,
                values.taxInPercentage,
                values.taxRate,
                values.totalRate,
                values.warranty,
                values.referenceNo,
                values.preOrdered,
                billStoragePath,
                itemStoragePath,
              ];
              pool.query(query, params, (err, res) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log("Inserted Successfully");
              });
            } catch (error) {
              console.log("error in filestream:  ", error);
            }
            try {
              var logArray = [];
              var logData = {
                operation: "Item Added",
                user: accessingUser,
                dataOfOperation: new Date().toDateString(),
              };
              logArray.push(logData);
              var log = JSON.stringify(logArray);
              const query2 = `INSERT INTO items ("Serial_key", "Item_name","Used","Date","Condition", "Logs") VALUES ($1,$2,false,$3,'Not Used',$4)`;
              const params2 = [
                values.serialKey,
                values.itemName,
                values.invoiceDate,
                log,
              ];
              pool.query(query2, params2, (err, result) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log("Inserted into Item table successfully");
                res.status(200).json("success");
              });
            } catch (err) {
              console.log(err);
              res.status(200).json(-1);
            }
            // try{

            // }catch(err){
            //   console.log(err)
            //   res.status(200).json(-1)
            // }
            // // To insert the image in database

            // const BillBuffer = fs.readFileSync(billImageFilePath);
            // // console.log(BillBuffer);
            // const ItemBuffer = fs.readFileSync(itemImageFilePath);
            // const Billbase64 = BillBuffer.toString("base64");
            // console.log(Billbase64);
            // const Itembase64 = ItemBuffer.toString("base64");
            // const values = await JSON.parse(fields.values);

            // const query = `INSERT INTO purchase_items ("Serial_key","Item_name","Invoice_no","Date","Description","Quantity","RatePerQuantity","Rate","Tax","TaxRate","TotalRate","Warranty","Reference_no","PreOrdered","Bill_Image","Item_Image") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,decode($15, 'base64'),decode($16,'base64'))`;

            // const params = [
            //   values.serialKey,
            //   values.itemName,
            //   values.invoiceNo,
            //   values.invoiceDate,
            //   values.description,
            //   values.quantity,
            //   values.ratePerQuantity,
            //   values.rate,
            //   values.taxInPercentage,
            //   values.taxRate,
            //   values.totalRate,
            //   values.warranty,
            //   values.referenceNo,
            //   values.preOrdered,
            //   Billbase64,
            //   Itembase64,
            // ];
            // pool.query(query, params, (err, res) => {
            //   if (err) {
            //     console.log(err);
            //     return;
            //   }
            //   console.log("Inserted Successfully");
            // });
            // const fileStream = fs.createReadStream(filePath);
            // console.log(files.BillImage.mimetype);
            // res.setHeader("Content-Type", files.BillImage.mimetype);

            // fileStream.pipe(res);
          } else {
            res.status(200).json("SerialKey Already Exists");
          }
        }
      }
    });
  } else {
    res.status(404).send("Not found");
  }
}
