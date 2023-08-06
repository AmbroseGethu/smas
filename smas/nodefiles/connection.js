const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});

const insertUser = async (
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
  billimg,
  itemimg
) => {
  try {
    await client.connect(); // gets connection
    await client.query(
      `INSERT INTO "purchase_items" ("Serial_key","Item_name","Invoice_no","Date","Description","Quantity","RatePerQuantity","Rate","Tax","TaxRate","TotalRate","Warranty","Reference_no","PreOrdered","Bill_Image","Item_Image")  
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
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
        billimg,
        itemimg,
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

const fs = require("fs");
const imgbuf1 = fs.readFileSync("C://Users//Sakthi//Music//sunset.jpg");
const imgbuf2 = fs.readFileSync("C://Users//Sakthi//Music//sunset.jpg");
insertUser(
  2902,
  "desktop",
  2002,
  "12/02/2020",
  "desktop 24 inches lcd panel",
  2,
  10000,
  20000,
  3000,
  30,
  26000,
  2,
  "ref200",
  true,
  imgbuf1,
  imgbuf2
).then((result) => {
  if (result) {
    console.log("Recordinsertd inserted");
  }
});
