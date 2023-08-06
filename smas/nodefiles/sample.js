var express = require("express");
var app = express();
var fs = require("fs");
var PORT = 8000;
const imgbuf1 = fs.readFileSync("C://Users//Sakthi//Music//sunset.jpg");

const image = Buffer.from(imgbuf1, "binary");

app.get("/",function (req, res) {
    res.send("welcome to smas");
 

s;

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
console.log(image);
