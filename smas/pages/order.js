import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  InputLabel,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import styles from "../styles/Order.module.css";
import Link from "next/link";
import axios from "axios";
import { toTitleCase } from "@/components/TitleCase";
import { useRouter } from "next/router";
import { auth } from "@/components/Firebase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

function order() {
  const router = useRouter();
  const { authUser, setAuthUser } = useContext(userContext);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, []);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Media Queries
  const isXSScreen = useMediaQuery(`(max-width: 600px)`);
  const isMediumScreen = useMediaQuery(`(min-width: 600px)`);
  const isLargeScreen = useMediaQuery(`(min-width: 1200px)`);

  const [rows, setRows] = useState([]);
  const [rowsCopy, setRowsCopy] = useState([]);
  const addRows = (res, condition) => {
    console.log("RES: ", res);
    if (condition === "filtered") {
      setRowsCopy([]);
    } else if (condition === "onLoad") {
      setRowsCopy([...rows]);
    }
    if (res) {
      res.forEach((resObj) => {
        if (rowsCopy.length == 0) {
          rowsCopy.push(resObj);
        } else {
          const exists = rowsCopy.some(
            (row) => row.Order_name === resObj.Order_name
          );
          if (!exists) {
            rowsCopy.push(resObj);
          }
        }
      });
      setRows(rowsCopy);
    }
  };

  const fetchOrders = async () => {
    const formData = new FormData();
    formData.append("operation", "fetchOrders");
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const res = response.data;
    if (res == -2) {
      setSnackMessage("User Verification Error...");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (res == -1) {
      setSnackMessage("Error while sending to API..");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      addRows(res, "onLoad");
    }
  };

  const dateFormatConverter = (dte) => {
    let parts = dte.split("-");
    let newDate = new Date(parts[0], parts[1] - 1, parts[2]); // Note: month is zero-indexed
    let day = newDate.getDate();
    let month = newDate.getMonth() + 1; // Note: add 1 to get the correct month
    let year = newDate.getFullYear();
    let formattedDate = `${day < 10 ? "0" + day : day}-${
      month < 10 ? "0" + month : month
    }-${year}`;
    return formattedDate;
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
  // Date Filter

  const dateFilter = async () => {
    if (fromDate == null && toDate == null) {
      fetchOrders();
      return;
    }
    const formData = new FormData();
    formData.append("operation", "fetchOrdersByDate");
    formData.append("fromDate", JSON.stringify(fromDate));
    formData.append("toDate", JSON.stringify(toDate));

    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const res = response.data;
    if (res == -2) {
      setSnackMessage("User Verification Error...");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      addRows(res, "filtered");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isMediumScreen]);

  useEffect(() => {
    console.log("ROWS: ", rows);
  }, [rows]);

  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  const isSelected = (name) => selected.indexOf(name) !== -1;

  // OrderView Handling

  const orderViewHandler = (row) => {
    console.log(row);
    router.push({
      pathname: "/orderView",
      query: { name: row.Order_name },
    });
  };

  return auth.currentUser ? (
    <Box
      component="div"
      sx={{
        display: "flex",
        // flexGrow: 1,
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#A6D0DD",
        // overflowY: "hidden"
      }}
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
      <Card sx={{ width: isMediumScreen && !isLargeScreen ? "90%" : "80%" }}>
        <CardContent>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                // flexDirection: isXSScreen ? "row" : "column",
              }}
            >
              <Grid container spacing={2}>
                <Grid
                  item
                  sx={{
                    display: "flex",
                    flexDirection: isLargeScreen ? "row" : "column",
                    alignItems: isLargeScreen ? "center" : "flex-start",
                    gap: isLargeScreen ? 2 : 1,
                  }}
                  xs={12}
                  sm={6}
                  md={5}
                  lg={5}
                >
                  <InputLabel
                    htmlFor="fromDateId"
                    sx={{ color: "black", paddingLeft: 2 }}
                  >
                    From:
                  </InputLabel>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      id="fromDateId"
                      inputFormat="DD/MM/YYYY"
                      value={fromDate}
                      onChange={(newValue) => {
                        setFromDate(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          inputProps={{
                            style: { border: "2px solid blue" },
                          }}
                          {...params}
                          sx={{}}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid
                  item
                  sx={{
                    display: "flex",
                    flexDirection: isLargeScreen ? "row" : "column",
                    alignItems: isLargeScreen ? "center" : "flex-start",
                    gap: isLargeScreen ? 2 : 1,
                  }}
                  xs={12}
                  sm={6}
                  md={5}
                  lg={5}
                >
                  <InputLabel htmlFor="toDateId" sx={{ color: "black" }}>
                    To:
                  </InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      id="toDateId"
                      inputFormat="DD/MM/YYYY"
                      value={toDate}
                      onChange={(newValue) => {
                        setToDate(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          inputProps={{
                            style: {
                              border: "2px solid black",
                            },
                          }}
                          // style={{ width: 222 }}
                          {...params}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={2}
                  lg={2}
                  sx={{
                    display: "flex",
                    flexDirection: isLargeScreen ? "row" : "column",
                    alignItems: isLargeScreen ? "center" : "flex-start",
                    gap: isLargeScreen ? 2 : 2,
                  }}
                >
                  <InputLabel
                    htmlFor="toDateId"
                    sx={{ color: "black", visibility: "hidden" }}
                  >
                    To:
                  </InputLabel>
                  <Button
                    variant="contained"
                    sx={{
                      background: "black",
                      "&:hover": {
                        background: "#333",
                      },
                    }}
                    onClick={dateFilter}
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card
        sx={{
          width: isMediumScreen && !isLargeScreen ? "90%" : "80%",
          marginTop: 2,
        }}
      >
        <CardContent>
          <Grid container sx={{ display: "flex", gap: 2 }}>
            <Grid item>
              <Link
                href={`http://${rootDirectory}:3000/addOrder`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "black",
                    color: "black",
                    "&:hover": {
                      borderColor: "black",
                      background: "#eee",
                    },
                  }}
                >
                  NEW ORDER <AddIcon />
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow sx={{ background: "black" }}>
                      <TableCell
                        sx={{ color: "white", fontSize: "16px" }}
                        align="left"
                      >
                        Order Name
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", fontSize: "16px" }}
                        align="center"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", fontSize: "16px" }}
                        align="right"
                      >
                        View More
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stableSort(rows, getComparator(order, orderBy))
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => {
                        // const isItemSelected = isSelected(row.name);
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          // <TableRow
                          //   hover
                          //   onClick={(event) => handleClick(event, row.name)}
                          //   role="checkbox"
                          //   // aria-checked={isItemSelected}
                          //   tabIndex={-1}
                          //   key={row.Order_name}
                          //   // selected={isItemSelected}
                          //   sx={{ cursor: "pointer" }}
                          // >
                          <TableRow>
                            <TableCell align="left">
                              {toTitleCase(row.Order_name)}
                            </TableCell>
                            <TableCell align="center">
                              {dateFormatConverter(row.Date.slice(0, 10))}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                onClick={() => orderViewHandler(row)}
                              >
                                {" "}
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: (dense ? 33 : 53) * emptyRows,
                        }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  ) : (
    <div></div>
  );
}

export default order;
