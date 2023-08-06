import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toTitleCase } from "@/components/TitleCase";
import { useRouter } from "next/router";
import { auth, db } from "@/components/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { userContext } from "./_app";
import { Backdrop, CircularProgress } from "@mui/material";
import { rootDirectory } from "@/components/RootDirectory";

function users() {
  const { authUser, setAuthUser } = useContext(userContext);

  const router = useRouter();
  useEffect(() => {
    console.log("AuthUser from Dashboard  : ", authUser);

    if (authUser != "guest" && authUser.details.NewUser == true) {
      router.push("/newPassword");
    } else if (!auth.currentUser) {
      router.push("/login");
    }
  }, [authUser]);
  // Backdrop
  const [open, setOpen] = useState(false);

  const fetchUsersOnLoad = async () => {
    setOpen(true);
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/user `,
      {
        condition: "fetchUsers",
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    if (response.data) {
      setOpen(false);
    }
    if (response.data == -2) {
      setSnackMessage("User verification failed...");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      console.log("FETCHUSERSONLOAD: ", response.data);
      const responseData = await response.data;
      addRows(responseData, "orderRows");
    }
  };

  // Snackbar

  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");
  const [snackMessage, setSnackMessage] = useState("");
  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
  };

  useEffect(() => {
    if (snackMessage == "User Deleted..") {
      fetchUsersOnLoad();
    }
    if (!auth.currentUser) {
      router.push("/login");
    } else {
      fetchUsersOnLoad();
    }
  }, [snackBar]);

  // Fetch Users
  const [rows, setRows] = useState([]);

  const addRows = (res, condition) => {
    if (condition === "orderRows") {
      const myrows = [];
      res.forEach((row) => {
        if (row.Designation == "HoD") {
          myrows.push(row);
        }
      });
      res.forEach((row) => {
        if (row.Designation == "Administrator") {
          myrows.push(row);
        }
      });
      res.forEach((row) => {
        if (row.Designation == "Staff") {
          myrows.push(row);
        }
      });
      console.log("MYROWS: ", myrows);
      setRows(myrows);
    }
  };

  const deleteUser = async (row) => {
    if (row.Name == authUser.details.Name) {
      setSnackMessage("You cannot delete your own account");
      setSnackSeverity("error");
      setSnackBar(true);
      return;
    }
    if (window.prompt("Enter CONFIRM to delete the user: ") == "CONFIRM") {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/user`,
        {
          condition: "deleteUser",
          row: JSON.stringify(row),
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      if (response.data == -2) {
        setSnackMessage("User verification failed...");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (response.data == 1) {
        setSnackMessage("User Deleted..");
        setSnackSeverity("success");
        setSnackBar(true);
      } else {
        setSnackMessage(response.data);
        setSnackSeverity("error");
        setSnackBar(true);
      }
    }
  };

  // Table
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

  return auth.currentUser ? (
    <Grid
      container
      sx={{
        background: "hotpink",
        display: "flex",
        justifyContent: "center",
        padding: "50px",
        alignItems: "center",
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Card sx={{ width: "90%", height: "fit-content" }}>
        <CardContent>
          <Link href="/addUser">
            <Button
              variant="contained"
              sx={{
                background: "black",
                "&:hover": {
                  background: "#333",
                },
              }}
            >
              <AddIcon /> Add User
            </Button>
          </Link>

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ background: "black" }}>
                  <TableCell
                    sx={{ color: "white", fontSize: "16px" }}
                    align="left"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontSize: "16px" }}
                    align="center"
                  >
                    Mobile No
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontSize: "16px" }}
                    align="right"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontSize: "16px" }}
                    align="right"
                  >
                    Designation
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontSize: "16px" }}
                    align="right"
                  >
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                          {toTitleCase(row.Name)}
                        </TableCell>
                        <TableCell align="center">{row.Mobile}</TableCell>
                        <TableCell align="right">{row.Email}</TableCell>
                        <TableCell align="right">{row.Designation}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            sx={{
                              "&:hover": {
                                background: "#fee6ea",
                              },
                            }}
                            onClick={(e) => deleteUser(row)}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
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
        </CardContent>
      </Card>
    </Grid>
  ) : (
    <div></div>
  );
}

export default users;
