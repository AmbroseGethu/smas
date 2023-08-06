import formidable from "formidable";
import fs from "fs";
import path from "path";
const pg = require("pg");

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
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error uploading file");
      } else {
        // const filePath = files.BillImage.filepath;
        const installationReportPath = files.installationReport.filepath;
        const values = await JSON.parse(fields.values);

        const installationReportExtension = path.extname(
          files.installationReport.originalFilename
        );
        // New try to store image in server fs

        const reportStoragePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "installationReports",
          `${values.serialKey}${installationReportExtension}`
        );

        const installationReport = files.installationReport;
        try {
          fs.writeFile(
            reportStoragePath,
            fs.readFileSync(installationReport.filepath),
            (err) => {
              if (err) {
                console.error(err);
                res.status(500).send("Error uploading file");
              } else {
                console.log("Finished bill uploading");
                res.status(200).json("Finished uploading report");
              }
            }
          );
        } catch (error) {
          console.log("error in filestream:  ", error);
        }
      }
    });
  } else {
    res.status(404).send("Not found");
  }
}
