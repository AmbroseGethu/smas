import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import styles from "../styles/Item.module.css";
import ComponentDialog from "./ComponentDialog";
import ItemDescriptionDialog from "./ItemDescriptionDialog";
import StaffDialog from "./StaffDialog";
import { userContext } from "@/pages/_app";
import { rootDirectory } from "./RootDirectory";

function ItemFilterForm({ usedKeys, newKeys, itemNavActive }) {
  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
  };

  const [formDetails, setFormDetails] = useState({
    location1: "",
    location2: "",
    location3: "",
    staff: "",
    component: "",
    serialKey: "",
  });

  const [components, setComponents] = useState("");
  const [location1, setLocation1] = useState("");
  const [location2, setLocation2] = useState("");
  const [location3, setLocation3] = useState("");
  // const [selectedLocations, setSelectedLocations] = useState({
  //   location1: "",
  //   location2: "",
  //   location3: "",
  // });

  // Media Queries
  const isXSScreen = useMediaQuery(`(max-width: 600px)`);
  const isMediumScreen = useMediaQuery(`(min-width: 600px)`);
  const isLargeScreen = useMediaQuery(`(min-width: 1200px)`);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedSerialKey, setSelectedSerialKey] = useState("");
  const [serialKeyDialogOpen, setSerialKeyDialogOpen] = useState(false);
  const [itemDescriptionDialogOpen, setItemDescriptionDialogOpen] =
    useState(false);
  const [serialKeyWithRegistry, setSerialKeyWithRegistry] = useState([]);
  // API Calls

  // Getting the global serial keys

  const getSerialKeys = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchSerialKeys`,
      {
        condition: itemNavActive,
      }
    );
    const res = response.data;
    console.log("SerialKEY: ", res);
    const listOfKeys = res.map((data) => {
      return {
        SerialKey: data.Serial_key,
        StockValueChanged: false,
        StockPageNo: data.StockPageNo,
        StockSerialNo: data.StockSerialNo,
        StockVolumeNo: data.StockVolumeNo,
      };
    });
    const listOfOnlyKeys = res.map((data) => data.Serial_key);
    console.log("LIST OF KEYS: ", listOfKeys);
    setSerialKeyWithRegistry(listOfKeys);
    setSerialKeys(listOfOnlyKeys);
  };

  // Location1
  const fetchLocation1 = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchLocations`,
      {
        location: "base",
        formDetails: formDetails,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const tempResponse = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      const listOfLocations = tempResponse?.map((loc) => {
        return loc.location1;
      });
      if (listOfLocations.length > 0) {
        setLocation1(listOfLocations);
      } else {
        setLocation1(["None"]);
      }
    }
  };

  // Location 2
  const fetchLocation2 = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchLocations`,
      {
        operation: "fetchLocation2",
        locations: { location1: formDetails.location1 },
        component: formDetails.component,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const tempResponse = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      console.log("response for location2: ", tempResponse);
      const listOfLocations = tempResponse?.map((loc) => {
        return loc.location2;
      });
      if (listOfLocations.length > 0) {
        setLocation2(listOfLocations);
      } else {
        setLocation2(["None"]);
      }
    }
  };

  // Location 3
  const fetchLocation3 = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchLocations`,
      {
        operation: "fetchLocation3",
        locations: {
          location1: formDetails.location1,
          location2: formDetails.location2,
        },
        component: formDetails.component,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const tempResponse = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      const listOfLocations = tempResponse?.map((loc) => {
        return loc.location3;
      });
      if (listOfLocations.length > 0) {
        setLocation3(listOfLocations);
      } else {
        setLocation3(["None"]);
      }
    }
  };

  // Fetching Serial keys based on location condition

  const fetchSerialKeysOnCondition = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchSerialKeys`,
      {
        operation: "fetchSerialKeysOnCondition",
        condition: itemNavActive,
        locations: formDetails,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log("SerialKeysFetched: ", response.data);
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      const tempResponse = response.data;
      const newSerialKeys = tempResponse.map((res) => {
        return {
          SerialKey: res.Serial_key,
          StockEntried: res.StockEntried,
          StockPageNo: res.StockPageNo,
          StockVolumeNo: res.StockVolumeNo,
          StockValueChanged: false,
        };
      });
      const newOnlySerialKeys = tempResponse.map((res) => res.Serial_key);
      setSerialKeyWithRegistry(newSerialKeys);
      setSerialKeys(newOnlySerialKeys);
    }
  };

  // Component list based on location

  const getComponentList = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getComponents`,
      {
        condition: itemNavActive,
        locations: formDetails,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const tempRes = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      console.log("Component List: ", tempRes);
      var res = tempRes.map((data) => {
        return data.Item_name;
      });

      setComponents(res);
    }
  };

  // Getting selected component details

  const getComponentDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getComponents`,
      {
        condition: "Component",
        component: formDetails.component,
        itemNavActive: itemNavActive,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const tempRes = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      // console.log(tempRes);
      const res = tempRes.map((data) => {
        return {
          SerialKey: data.Serial_key,
          StockValueChanged: false,
          StockPageNo: data.StockPageNo,
          StockVolumeNo: data.StockVolumeNo,
          StockSerialNo: data.StockSerialNo,
        };
      });
      const keysOnly = tempRes.map((data) => data.Serial_key);
      setSerialKeyWithRegistry(res);
      setSerialKeys(keysOnly);
    }
  };

  // Functions

  const viewButton = (skey) => {
    serialKeySelector(skey);
  };

  const serialKeySelector = (e) => {
    setSelectedSerialKey(e);
    setSerialKeyDialogOpen(false);
  };

  const handleStockChange = (index, e, column) => {
    const updatedSerialKeys = [...serialKeyWithRegistry];
    updatedSerialKeys[index] = {
      ...updatedSerialKeys[index],
      [column]: e.target.value,
      StockValueChanged: true,
    };
    setSerialKeyWithRegistry(updatedSerialKeys);
  };

  const handleStockSave = async (index) => {
    if (serialKeyWithRegistry[index].StockValueChanged == false) return;
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/editItemAPI`,
      {
        formData: serialKeyWithRegistry[index],
        condition: "updateStockRegisterData",
        user: authUser.details.Name,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      console.log("Response on Stock Response: ", response.data);
    }
  };

  // UseEffect Hooks

  // Fetch Serial key on component mount

  const [serialKeys, setSerialKeys] = useState([]);
  useEffect(() => {
    getSerialKeys();
    getComponentList();

    fetchLocation1();
    setFormDetails((details) => ({
      ...details,
      location1: "",
      location2: "",
      location3: "",
      component: "",
      serialKey: "",
    }));
    setSelectedSerialKey("");
  }, [itemNavActive]);

  // Form details

  useEffect(() => {
    if (formDetails.location1 == "") {
      fetchLocation1();
      // fetchSerialKeysOnCondition();
    } else if (formDetails.location1 != "" && formDetails.location2 == "") {
      fetchLocation2();
      fetchSerialKeysOnCondition();
    } else if (formDetails.location2 != "" && formDetails.location3 == "") {
      fetchLocation3();
      fetchSerialKeysOnCondition();
    } else if (formDetails.location3 != "") {
      fetchSerialKeysOnCondition();
    }
  }, [formDetails]);

  // formDetails.location1

  useEffect(() => {
    setFormDetails((details) => ({ ...details, location2: "", location3: "" }));
  }, [formDetails.location1]);

  // FormDetails.component

  useEffect(() => {
    if (formDetails.component != "") {
      getComponentDetails();
      // setSerialKeyDialogOpen(true);
    }
  }, [formDetails.component]);

  // Accessibility of user

  const { authUser } = useContext(userContext);
  const [access, setAccess] = useState(0);

  // const getAccessibility = async () => {
  //   const response = await axios.post("http://${rootDirectory}:3000/api/user", {
  //     token: authUser.token,
  //     serialKey: formDetails.serialKey,
  //     condition: "fetchAccessibility",
  //   });
  //   console.log(response.data);
  //   if (response.data == 1 || response.data == 0) {
  //     setAccess(response.data);
  //   } else {
  //     setSnackMessage("Error fetching Accessibility: ");
  //     setSnackSeverity("error");
  //     setSnackBar(true);
  //   }
  // };

  // For ItemDescriptionDialog Box

  useEffect(() => {
    if (selectedSerialKey !== "" && selectedSerialKey !== null) {
      setFormDetails((details) => ({
        ...details,
        serialKey: selectedSerialKey,
      }));
      setItemDescriptionDialogOpen("true");
      // if (getAccessibility() == true) {
      //   setItemDescriptionDialogOpen("true");
      // }
    }
  }, [selectedSerialKey]);

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

  return (
    <Grid container spacing={2} className={styles.formGridContainer}>
      <Grid
        item
        xs={12}
        sm={12}
        md={12}
        className={styles.form__itemContainer}
        sx={{ width: "100%" }}
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
        </Snackbar>{" "}
        <InputLabel sx={{ color: "black" }} htmlFor="serialKeySearchBox">
          Serial Number:{" "}
        </InputLabel>
        <Autocomplete
          onChange={(event, newValue) => serialKeySelector(newValue)}
          freeSolo
          id="serialKeySearchBox"
          // disableClearable
          options={serialKeys}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Serial Key"
              InputProps={{
                ...params.InputProps,
                // type: "search",
              }}
            />
          )}
          sx={{ minWidth: 120, width: isXSScreen ? 125 : 150 }}
          className={styles.item__inputField}
        />
      </Grid>
      {itemNavActive == "new" ? null : (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          className={styles.form__itemContainer}
          sx={{ width: "100%" }}
        >
          <InputLabel sx={{ color: "black" }} htmlFor="location1Id">
            Location1:{" "}
          </InputLabel>
          <FormControl sx={{ minWidth: 120, width: isXSScreen ? 125 : 150 }}>
            <InputLabel htmlFor="location1Id-label">Location 1</InputLabel>
            <Select
              labelId="location1Id-label"
              id="locationId1"
              value={formDetails.location1}
              label="Location1"
              onChange={(e) =>
                setFormDetails((details) => ({
                  ...details,
                  location1: e.target.value,
                }))
              }
              className={styles.item__inputField}
            >
              {location1.length > 0 &&
                location1.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {formDetails.location1 != "" && (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          className={styles.form__itemContainer}
          sx={{ width: "100%" }}
        >
          <InputLabel sx={{ color: "black" }} htmlFor="location2Id">
            Location2:{" "}
          </InputLabel>
          <FormControl sx={{ minWidth: 120, width: isXSScreen ? 125 : 150 }}>
            <InputLabel htmlFor="location2Id-label">Location 2</InputLabel>
            <Select
              labelId="location2Id-label"
              id="location2Id"
              value={formDetails.location2}
              label="Location2"
              onChange={(e) =>
                setFormDetails((details) => ({
                  ...details,
                  location2: e.target.value,
                }))
              }
              className={styles.item__inputField}
            >
              {location2.length > 0 &&
                location2.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {formDetails.location2 != "" && (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          className={styles.form__itemContainer}
          sx={{ width: "100%" }}
        >
          <InputLabel sx={{ color: "black" }} htmlFor="location3Id">
            Location3:{" "}
          </InputLabel>
          <FormControl sx={{ minWidth: 120, width: isXSScreen ? 125 : 150 }}>
            <InputLabel htmlFor="location3Id-label">Location 3</InputLabel>
            <Select
              labelId="location3Id-label"
              id="location3Id"
              value={formDetails.location3}
              label="Location3"
              onChange={(e) =>
                setFormDetails((details) => ({
                  ...details,
                  location3: e.target.value,
                }))
              }
              className={styles.item__inputField}
            >
              {location3.length > 0 &&
                location3.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {selectedStaff != null && itemNavActive != "new" ? (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          className={styles.form__itemContainer}
          sx={{ width: "100%" }}
        >
          <InputLabel sx={{ color: "black" }} htmlFor="staffId">
            Selected Staff:{" "}
          </InputLabel>
          <FormControl sx={{ minWidth: 120, width: isXSScreen ? 125 : 150 }}>
            <InputLabel htmlFor="staffId-label">Staff</InputLabel>
            <Select
              labelId="staffId-label"
              id="staffId"
              value={selectedStaff}
              label="Staff"
              onChange={(e) => {
                setFormDetails((details) => ({
                  ...details,
                  staff: e.target.value,
                }));
                setSelectedStaff(e.target.value);
              }}
              className={styles.item__inputField}
            >
              {staffs.map((staff) => (
                <MenuItem key={staff} value={staff}>
                  {staff}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ) : null}
      {/* <Button variant="outlined" onClick={() => setStaffDialogOpen(true)}>
        Click Me
      </Button> */}
      {/* {formDetails.location === "Staff Room" ? (
        <StaffDialog
          staffs={staffs}
          handler={handleStaffDialogClose}
          openHandler={staffDialogOpen}
          selectTheStaff={staffSelector}
        />
      ) : null} */}
      <Grid
        item
        xs={12}
        sm={12}
        md={12}
        className={styles.form__itemContainer}
        sx={{ width: "100%" }}
      >
        <InputLabel sx={{ color: "black" }} htmlFor="locationId">
          Component:{" "}
        </InputLabel>
        <FormControl
          sx={{
            minWidth: 120,
            width: isXSScreen ? 125 : 150,
          }}
        >
          <InputLabel htmlFor="locationId-label">Component</InputLabel>
          <Select
            labelId="componentId-label"
            id="componentId"
            value={formDetails.component}
            label="Component"
            onChange={(e) => {
              setFormDetails((details) => ({
                ...details,
                component: e.target.value,
                serialKey: "",
              }));
              setSelectedSerialKey("");
            }}
            className={styles.item__inputField}
            sx={{
              minWidth: 120,
              width: isXSScreen ? 125 : 150,
            }}
          >
            {components.length > 0
              ? components.map((component) => {
                  return (
                    <MenuItem key={component} value={component}>
                      {component}
                    </MenuItem>
                  );
                })
              : null}
          </Select>
        </FormControl>
      </Grid>
      {/* {components.length > 0 ? (
        <ComponentDialog
          serialKeys={serialKeys}
          handler={handleSerialKeyDialogClose}
          openHandler={serialKeyDialogOpen}
          selectTheSerialKey={serialKeySelector}
        />
      ) : null} */}

      <ItemDescriptionDialog
        openHandler={itemDescriptionDialogOpen}
        handler={(e) => {
          setItemDescriptionDialogOpen(false);
          setSelectedSerialKey("");
        }}
        serialKey={selectedSerialKey}
        itemNavActive={itemNavActive}
        itemStatusHandler={getSerialKeys}
        // accessibility={access}
      />
      {/* <Grid
        item
        xs={12}
        md={12}
        className={styles.form__submitButton}
        sx={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Button variant="outlined">Submit</Button>
      </Grid> */}
      <Grid item xs={12} sx={{ marginTop: 2 }}>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ background: "#000" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontSize: "16px",
                  }}
                  align="center"
                >
                  Serial Number
                </TableCell>
                {/* <TableCell
                  sx={{ color: "white", fontSize: "16px" }}
                  align="center"
                >
                  Show Item
                </TableCell> */}
                <TableCell
                  sx={{ color: "white", fontSize: "16px" }}
                  align="center"
                >
                  Page No
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontSize: "16px" }}
                  align="center"
                >
                  Serial No
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontSize: "16px" }}
                  align="center"
                >
                  Volume No
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontSize: "16px" }}
                  align="center"
                >
                  Save Stock Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(serialKeys, getComparator(order, orderBy))
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
                    <TableRow sx={{ background: "#fff", color: "white" }}>
                      {/* <TableCell align="center" sx={{ color: "black" }}>
                        {row}
                      </TableCell> */}
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          sx={{
                            background: "#205295  ",
                            color: "white",
                            "&:hover": {
                              background: "royalblue",
                            },
                          }}
                          onClick={(e) =>
                            viewButton(serialKeyWithRegistry[index].SerialKey)
                          }
                        >
                          {/* View */}
                          {serialKeyWithRegistry[index].SerialKey}
                        </Button>
                      </TableCell>
                      <TableCell align="center" sx={{ color: "black" }}>
                        <TextField
                          sx={{ width: "90px" }}
                          value={
                            serialKeyWithRegistry[index].StockPageNo == null
                              ? ""
                              : serialKeyWithRegistry[index].StockPageNo
                          }
                          onChange={(e) =>
                            handleStockChange(index, e, "StockPageNo")
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ color: "black" }}>
                        <TextField
                          sx={{ width: "90px" }}
                          value={
                            serialKeyWithRegistry[index].StockSerialNo == null
                              ? ""
                              : serialKeyWithRegistry[index].StockSerialNo
                          }
                          onChange={(e) =>
                            handleStockChange(index, e, "StockSerialNo")
                          }
                        />{" "}
                      </TableCell>
                      <TableCell align="center" sx={{ color: "black" }}>
                        <TextField
                          sx={{ width: "90px" }}
                          value={
                            serialKeyWithRegistry[index].StockVolumeNo == null
                              ? ""
                              : serialKeyWithRegistry[index].StockVolumeNo
                          }
                          onChange={(e) =>
                            handleStockChange(index, e, "StockVolumeNo")
                          }
                        />{" "}
                      </TableCell>
                      <TableCell align="center" sx={{ color: "black" }}>
                        <Button
                          variant="contained"
                          onClick={(e) => handleStockSave(index)}
                          disabled={
                            serialKeyWithRegistry[index].StockValueChanged ==
                            false
                              ? true
                              : false
                          }
                        >
                          Save
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
          count={serialKeys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </Grid>
  );
}
export default ItemFilterForm;
