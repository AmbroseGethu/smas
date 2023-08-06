var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
app.post("/api/purchase", function (req, res) {
  const insertPurchase = async (
    serialkey,
    itemname,
    invoiceno,
    date,
    desc,
    quantity,
    rateperquantity,
    rate,
    tax,
    taxrate,
    totrate,
    warranty,
    refno,
    preordered
  ) => {
    try {
      await client.connect(); // gets connection
      await client.query(
        `INSERT INTO "purchase_items" ("Serial_key","Item_name","Invoice_no","Date","Description","Quantity","RatePerQuantity","Rate","Tax","TaxRate","TotalRate","Warranty","Reference_no","PreOrdered")  
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          serialkey,
          itemname,
          invoiceno,
          date,
          desc,
          quantity,
          rateperquantity,
          rate,
          tax,
          taxrate,
          totrate,
          warranty,
          refno,
          preordered,
        ]
      ); // sends queries
      return true;
    } catch (error) {
      console.error(error.stack);
      return false;
    } finally {
      await client.end(); // closes connection
    }
  };

  const imgbuf1 = Buffer.from(new Uint8Array(req.body.itemImage));
  const imgbuf2 = Buffer.from(new Uint8Array(req.body.billImage));
  const skey = req.body.serialKey;
  const itemname = req.body.itemNmae;
  const invoiceno = req.body.invoiceNo;
  const invoicedate = req.body.invoiceDate;
  const desc = req.body.description;
  const qty = req.body.quantity;
  const rateperqty = req.body.ratePerQuantity;
  const rate = req.body.rate;
  const taxpercentage = req.body.taxInPercentage;
  const taxrate = req.body.taxRate;
  const totrate = req.body.totalRate;
  const warranty = req.body.warranty;
  const referenceno = req.body.referenceNo;
  const preordered = req.body.preOrdered;

  insertPurchase(
    skey,
    itemname,
    invoiceno,
    invoicedate,
    desc,
    qty,
    rateperqty,
    rate,
    taxrate,
    taxpercentage,
    totrate,
    warranty,
    referenceno,
    preordered
  ).then((result) => {
    if (result) {
      res.end("Inserted Successfully");
    } else {
      res.end("Error in insertion");
    }
  });
});
var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
