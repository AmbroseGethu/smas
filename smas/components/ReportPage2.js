import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "../styles/reportPage2.module.css";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import axios from "axios";
import { rootDirectory } from "./RootDirectory";
import { userContext } from "@/pages/_app";
import ReportPage1 from "./ReportPage1";

const columns = [
  { id: 0, visible: true },
  { id: 1, visible: true },
  { id: 2, visible: true },
  { id: 3, visible: true },
  { id: 4, visible: true },
  { id: 5, visible: true },
  { id: 6, visible: true },
  { id: 7, visible: true },
  { id: 8, visible: true },
  { id: 9, visible: true },
  { id: 10, visible: true },
  { id: 11, visible: true },
  { id: 12, visible: true },
  { id: 13, visible: true },
  { id: 14, visible: true },
  { id: 15, visible: true },
];

const row = [1];

function ReportPage2() {
  const { authUser, setAuthUser } = useContext(userContext);
  const [data, setData] = useState(columns);
  const [rows, setRows] = useState(row);
  const tableRef = useRef(null);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState({
    itemLog: true,
    annexure2: false,
    annexure3: false,
  });
  const [serialKey, setSerialKey] = useState("");
  const [logPresent, setLogPresent] = useState(false);
  const [logData, setLogData] = useState([]);
  const [otherDetails, setOtherDetails] = useState([]);
  const [itemDetails, setItemDetails] = useState({
    itemName: "",
    serialKey: "",
  });

  const getLogReport = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/reportAPI`,
      {
        condition: "getLogReport",
        serialKey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == -1) {
      setSnackBar(true);
      setSnackMessage("Invalid SerialKey");
      setSnackSeverity("error");
      return;
    }
    setLogPresent(true);
    setLogData(response.data);
    var data = response.data;
    const filteredArray = data.map((obj) => {
      const filteredEntries = Object.entries(obj).filter(
        ([key]) =>
          key !== "dateOfOperation" && key !== "operation" && key !== "user"
      );
      return Object.fromEntries(filteredEntries);
    });
    const stringArray = filteredArray.map((obj) => {
      const entries = Object.entries(obj);
      const keyValuePairs = entries.map(([key, value]) => `${key}: ${value}`);
      return keyValuePairs.join(", ");
    });
    setOtherDetails(stringArray);
    const itemResponse = await axios.post(
      `http://${rootDirectory}:3000/api/reportAPI`,
      {
        condition: "getItemName",
        serialKey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    var itemData = itemResponse.data;
    if (itemData == -1) {
      return;
    }
    itemData = itemData.Item_name;
    setItemDetails({ itemName: itemData, serialKey: serialKey });
  };

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  const getItems = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/reportAPI`,
      {
        condition: "fetchItemDetails",
        year: AcademicYear,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const response2 = await axios.post(
      `http://${rootDirectory}:3000/api/reportAPI`,
      {
        condition: "fetchItemAmount",
        year: AcademicYear,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const data2 = response2.data;
    console.log("Report Response: ", response.data);
    const data = response.data;
    if (!data) return;
    const groupedItems = data.reduce((groups, item) => {
      const { Item_name, Condition, Serial_key } = item;

      const key = `${Item_name}-${Condition}-${Serial_key}`;
      if (!groups[key]) {
        groups[key] = {
          serialKeyArray: [],
          Item_name,
          Condition,
          count: 0,
          totalAmount: 0,
        };
      }

      groups[key].count++;
      groups[key].serialKeyArray.push(Serial_key);

      return groups;
    }, {});
    Object.values(groupedItems).forEach((group) => {
      const { serialKeyArray } = group;
      const matchingAmount = data2.find((item) =>
        serialKeyArray.some((key) => item.Serial_key === key)
      );
      if (matchingAmount) {
        // console.log(parseFloat(matchingAmount.rate));
        group.totalAmount = parseFloat(matchingAmount.TotalRate) * group.count;
      }
    });

    // Convert the groupedItems object into an array
    const transformedData = Object.values(groupedItems);

    // console.log(transformedData);
    setItems(transformedData);
  };

  const onDelete = (index) => {
    const newData = [...data];
    newData[index].visible = !newData[index].visible;
    setData(newData);
  };

  const handleResetColumns = () => {
    const newData = [...data];
    newData.map((i) => (i.visible = true));
    setData(newData);
  };

  const addRows = (i) => {
    const newRow = [...rows];
    newRow.push(i);
    setRows(newRow);
  };

  const deleteNewRows = (id) => {
    const newData = rows.filter((i) => i !== id);
    setRows(newData);
  };

  function downloadTable() {
    const table = document.getElementById("my-table");
    const workbook = XLSX.utils.table_to_book(table);
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "table.xlsx");
  }

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const handleDownloadAsExcel = () => {
    downloadTable();
  };

  const handleDownloadAsPDF = async () => {
    const input = tableRef.current;
    console.log(input);
    html2canvas(input)
      .then((canvas) => {
        const pdf = new jsPDF("l", "pt", "letter"); // Use landscape orientation
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 795.276; // Adjust the width to fit the landscape mode
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // Rotate the "Excess" and "Shortage" column names in the PDF
        // const rotationAngle = -90; // Specify the rotation angle (in degrees)
        // const excessShortageColumns = [13, 14]; // IDs of the "Excess" and "Shortage" columns

        // excessShortageColumns.forEach((columnId) => {
        //   const columnElement = document.getElementById(`column-${columnId}`);
        //   const { x, y, width, height } = columnElement.getBoundingClientRect();

        //   pdf.text("Excess", y + height / 2, x + width - 5, {
        //     angle: rotationAngle,
        //     align: "center",
        //     baseline: "middle",
        //   });
        // });

        pdf.save("table.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [AcademicYear, setAcademicYear] = useState(`31.03.${currentYear + 1}`);
  const [years, setYears] = useState([]);
  const getYears = () => {
    for (let i = currentYear - 5; i < currentYear + 1; i++) {
      const yearRange = `31.03.${i + 1}`;
      setYears((years) => [...years, yearRange]);
    }
    // setAcademicYear();
  };

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
  };

  useEffect(() => {
    getItems();
  }, [AcademicYear]);

  useEffect(() => {
    getYears();
  }, []);

  return (
    <main
      className={styles.main}
      style={{
        height: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
        paddingTop: 30,
        paddingBottom: 100,
      }}
    >
      <Grid container padding={4}>
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", marginBottom: 5 }}
        >
          <Snackbar
            open={snackBar}
            autoHideDuration={3000}
            onClose={handleClose}
            // action={action}
          >
            <Alert
              onClose={handleClose}
              severity={snackSeverity}
              sx={{ width: "100%" }}
            >
              {snackMessage}
            </Alert>
          </Snackbar>
          <ButtonGroup>
            <Button
              variant={active.itemLog ? "contained" : "outlined"}
              color={active.itemLog ? "error" : "warning"}
              onClick={(e) =>
                setActive({
                  itemLog: true,
                  annexure2: false,
                  annexure3: false,
                })
              }
            >
              Item Log{" "}
            </Button>
            <Button
              variant={active.annexure2 ? "contained" : "outlined"}
              color={active.annexure2 ? "error" : "warning"}
              onClick={(e) =>
                setActive({
                  itemLog: false,
                  annexure2: true,
                  annexure3: false,
                })
              }
            >
              STOCK{" "}
            </Button>
            {/* <Button
              variant={active.annexure3 ? "contained" : "outlined"}
              color={active.annexure3 ? "error" : "warning"}
              onClick={(e) =>
                setActive({
                  itemLog: false,
                  annexure2: false,
                  annexure3: true,
                })
              }
            >
              Annexure-III
            </Button> */}
          </ButtonGroup>
        </Grid>
        {(active.annexure2 == true || active.annexure3 == true) && (
          <>
            <Grid
              item
              xs={6}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: "bold",
                color: "black",
              }}
            >
              Select Financial Date:
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Year</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={AcademicYear}
                  defaultValue={years[years.length - 1]}
                  label="Age"
                  onChange={(e) => handleAcademicYearChange(e)}
                >
                  {years.length > 0 &&
                    years.map((item, index) => (
                      <MenuItem value={item} key={index}>
                        {item}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
      {active.itemLog == true && (
        <Grid container>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width: "90%" }}>
              <CardContent
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 3,
                  background: "#fff",
                  paddingRight: 0,
                }}
              >
                <span
                  style={{
                    width: "50%",
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Enter the Serial Key:{" "}
                </span>
                <TextField
                  value={serialKey}
                  onChange={(e) => setSerialKey(e.target.value)}
                />
                <span
                  style={{
                    width: "10%",
                    display: "flex",
                    justifyContent: "flex-end",
                    // background: "red",
                    marginLeft: 80,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      background: "hotpink",
                      "&:hover": { background: "#FFAACF" },
                    }}
                    onClick={(e) => getLogReport(e)}
                  >
                    Get log
                  </Button>
                </span>
              </CardContent>
            </Card>
          </Grid>
          {!logPresent && (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 150,
                fontSize: 30,
                color: "lightgrey",
              }}
            >
              Search with Serial Key for Log Report
            </div>
          )}
          {logPresent && (
            <Grid item xs={12} sx={{ marginTop: 5 }}>
              <table className={styles.table} id="my-table" ref={tableRef}>
                {data[1].visible && (
                  <tr>
                    <td
                      onClick={() => onDelete(1)}
                      className={styles.td}
                      colSpan={6}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                        ITEM LOG REPORT
                      </span>
                    </td>
                  </tr>
                )}
                {data[2].visible && (
                  <tr>
                    <td
                      onClick={() => onDelete(2)}
                      className={styles.td}
                      colSpan={4}
                    >
                      <span style={{ fontWeight: "bold" }}>SERIAL KEY:</span>
                      <span style={{ marginLeft: "10px" }}>
                        {itemDetails.serialKey}
                      </span>
                    </td>
                    <td
                      onClick={() => onDelete(2)}
                      className={styles.td}
                      colSpan={3}
                    >
                      <span style={{ fontWeight: "bold" }}>Item Name:</span>
                      <span style={{ marginLeft: "10px" }}>
                        {itemDetails.itemName}
                      </span>
                    </td>
                  </tr>
                )}
                {data[3].visible && (
                  <tr>
                    <td
                      onClick={() => onDelete(3)}
                      className={styles.td}
                      colSpan={6}
                      style={{ fontWeight: "bold" }}
                    >
                      Log Report till {AcademicYear}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    rowSpan={1}
                    className={styles.td}
                    style={{ fontWeight: "bold" }}
                  >
                    S.NO
                  </td>
                  {data[11].visible && (
                    <td
                      onClick={() => onDelete(11)}
                      rowSpan={1}
                      className={styles.td}
                      style={{ fontWeight: "bold" }}
                    >
                      Date
                    </td>
                  )}
                  {data[4].visible && (
                    <td
                      onClick={() => onDelete(4)}
                      rowSpan={1}
                      className={styles.td}
                      style={{ fontWeight: "bold" }}

                      // colSpan={7}
                    >
                      Operation
                    </td>
                  )}

                  {data[7].visible && (
                    <td
                      onClick={() => onDelete(7)}
                      rowSpan={1}
                      className={styles.td}
                      style={{ fontWeight: "bold" }}
                    >
                      User
                    </td>
                  )}

                  {data[10].visible && (
                    <td
                      onClick={() => onDelete(10)}
                      rowSpan={1}
                      className={styles.td}
                      style={{ fontWeight: "bold" }}
                    >
                      Other Details
                    </td>
                  )}
                </tr>

                {logData.map((i, index) => (
                  <tr>
                    <td
                      onClick={() => deleteNewRows(i)}
                      className={styles.td}
                      colSpan={1}
                    >
                      {index + 1}
                    </td>
                    {data[11].visible && (
                      <td
                        onClick={() => deleteNewRows(i)}
                        className={styles.td}
                        colSpan={1}
                      >
                        {i.dataOfOperation
                          ? i.dataOfOperation
                          : i.dateOfOperation}
                      </td>
                    )}
                    {data[4].visible && (
                      <td
                        onClick={() => deleteNewRows(i)}
                        className={styles.td}
                        colSpan={1}
                      >
                        {i.operation}
                      </td>
                    )}
                    {data[7].visible && (
                      <td
                        onClick={() => deleteNewRows(i)}
                        className={styles.td}
                        colSpan={1}
                      >
                        {i.user}
                      </td>
                    )}
                    {data[10].visible && (
                      <td
                        onClick={() => deleteNewRows(i)}
                        className={styles.td}
                        colSpan={1}
                      >
                        {otherDetails[index] == "" ? "-" : otherDetails[index]}
                      </td>
                    )}
                  </tr>
                ))}
              </table>
            </Grid>
          )}
        </Grid>
      )}
      {active.annexure2 == true && (
        <div style={{ marginTop: "20px" }}>
          <table className={styles.table} id="my-table" ref={tableRef}>
            {data[1].visible && (
              <tr>
                <td
                  onClick={() => onDelete(1)}
                  className={styles.td}
                  colSpan={6}
                >
                  <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                    STOCK REPORT
                  </span>
                </td>
              </tr>
            )}
            {data[2].visible && (
              <tr>
                <td
                  onClick={() => onDelete(2)}
                  className={styles.td}
                  colSpan={3}
                >
                  <span style={{ fontWeight: "bold" }}>Name of the Dept:</span>
                  <span style={{ marginLeft: "10px" }}>
                    Information Technology
                  </span>
                </td>
                <td
                  onClick={() => onDelete(2)}
                  className={styles.td}
                  colSpan={3}
                >
                  <span style={{ fontWeight: "bold" }}>
                    Stock Register Name & Volume NO:
                  </span>
                  <span style={{ marginLeft: "10px" }}>
                    Non consumable register vol2
                  </span>
                </td>
              </tr>
            )}
            {data[3].visible && (
              <tr>
                <td
                  onClick={() => onDelete(3)}
                  className={styles.td}
                  colSpan={6}
                >
                  Statement of verification of stocks as on {AcademicYear}
                </td>
              </tr>
            )}
            <tr>
              <td rowSpan={1} className={styles.td}>
                S.NO
              </td>
              {/* <td colSpan={3} className={styles.td}>
              Stock Register
            </td> */}
              {data[4].visible && (
                <td
                  onClick={() => onDelete(4)}
                  rowSpan={1}
                  className={styles.td}
                  // colSpan={7}
                >
                  Stock Items and Description
                </td>
              )}
              {/* {data[5].visible && (
              <td onClick={() => onDelete(5)} rowSpan={2} className={styles.td}>
                Stock item identification number
              </td>
            )}
            {data[6].visible && (
              <td onClick={() => onDelete(6)} rowSpan={2} className={styles.td}>
                stock item reference number
              </td>
            )} */}
              {data[7].visible && (
                <td
                  onClick={() => onDelete(7)}
                  rowSpan={1}
                  className={styles.td}
                >
                  Condition
                </td>
              )}
              {/* {data[8].visible && (
              <td onClick={() => onDelete(8)} rowSpan={2} className={styles.td}>
                BOOK FIGURE QUANTITY
              </td>
            )} */}
              {/* {data[9].visible && (
              <td className={styles.td} rowSpan={2} onClick={() => onDelete(9)}>
                BOOK VALUE IN INR
              </td>
            )} */}

              {data[10].visible && (
                <td
                  onClick={() => onDelete(10)}
                  rowSpan={1}
                  className={styles.td}
                >
                  ACUTAL QUANTITY IN NOS
                </td>
              )}
              {data[11].visible && (
                <td
                  onClick={() => onDelete(11)}
                  rowSpan={1}
                  className={styles.td}
                >
                  VALUE OF ACTUALS IN INR
                </td>
              )}

              {/* {data[13].visible && (
              <td
                onClick={() => onDelete(13)}
                rowSpan={2}
                className={styles.td}
                // style={{ writingMode: "vertical-rl" }}
                id={`column-13`}
              >
                Excess
              </td>
            )}
            {data[14].visible && (
              <td
                onClick={() => onDelete(14)}
                rowSpan={2}
                className={styles.td}
                // style={{ writingMode: "vertical-rl" }}
                id={`column-14`}
              >
                Shortage
              </td>
            )} */}
              {/* {data[15].visible && (
              <td
                onClick={() => onDelete(15)}
                rowSpan={1}
                className={styles.td}
              >
                Remarks
              </td>
            )} */}
            </tr>
            {/* <tr>
            <td className={styles.td}>Vol No</td>
            <td className={styles.td}>Page No</td>
            <td className={styles.td}>Serial No</td>
          </tr> */}
            {items.map((i, index) => (
              <tr>
                <td
                  onClick={() => deleteNewRows(i)}
                  className={styles.td}
                  colSpan={1}
                >
                  {index + 1}
                </td>
                {data[4].visible && (
                  <td
                    onClick={() => deleteNewRows(i)}
                    className={styles.td}
                    colSpan={1}
                  >
                    {i.Item_name}
                  </td>
                )}
                {data[7].visible && (
                  <td
                    onClick={() => deleteNewRows(i)}
                    className={styles.td}
                    colSpan={1}
                  >
                    {i.Condition}
                  </td>
                )}
                {data[10].visible && (
                  <td
                    onClick={() => deleteNewRows(i)}
                    className={styles.td}
                    colSpan={1}
                  >
                    {i.count}
                  </td>
                )}
                {data[11].visible && (
                  <td
                    onClick={() => deleteNewRows(i)}
                    className={styles.td}
                    colSpan={1}
                  >
                    Rs.{i.totalAmount}
                  </td>
                )}
              </tr>
            ))}
          </table>
        </div>
      )}
      {/* {active.annexure3 && <ReportPage1 year={AcademicYear} />} */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: 20,
        }}
      >
        {((active.itemLog == true && logPresent == true) ||
          active.annexure2 == true) && (
          <ButtonGroup>
            <Button
              variant="contained"
              color="error"
              onClick={handleResetColumns}
            >
              Reset All Columns
            </Button>
            {/* <Button variant="contained" onClick={() => addRows(rows.length + 1)}>
        Add Rows
      </Button> */}
            <Button
              variant="contained"
              color="warning"
              onClick={handleDownloadAsExcel}
            >
              Download as Excel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownloadAsPDF}
            >
              Download as PDF
            </Button>
          </ButtonGroup>
        )}
      </div>
    </main>
  );
}

export default ReportPage2;
