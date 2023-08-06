import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useContext, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { toTitleCase } from "@/components/TitleCase";
import { useRouter } from "next/router";
import { auth } from "@/components/Firebase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

function orderView() {
  const { authUser } = useContext(userContext);
  const router = useRouter();
  useEffect(() => {
    console.log("AuthUser from Dashboard  : ", authUser);

    if (authUser != "guest" && authUser.details.NewUser == true) {
      router.push("/newPassword");
    } else if (!auth.currentUser) {
      router.push("/login");
    }
  }, [authUser]);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  // useState Hooks
  const [orderDetails, setOrderDetails] = useState({
    orderName: "",
    orderDate: null,
    description: "none",
    items_name: [],
    quantities: [],
    quotations: [],
  });

  const fetchOrderDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      {
        orderName: router.query.name,
        operation: "fetchMyOrder",
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      const res = response.data;
      const desc = res.Description;
      console.log(desc);
      if (res != "error") {
        setOrderDetails((details) => ({
          ...details,
          orderDate: res.Date,
          description: JSON.parse(res.Description),
          items_name: JSON.parse(res.Items_name),
          quantities: JSON.parse(res.Quantities),
          quotations: JSON.parse(res.Quotations),
        }));
      }
    }
  };

  useEffect(() => {
    console.log("OrderDetails");
    console.log(orderDetails);
  }, [orderDetails]);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
    if (router.query.name && router.query.name != "") {
      setOrderDetails((e) => ({ ...e, orderName: router.query.name }));
      fetchOrderDetails();
    } else {
      router.push("/order");
    }
  }, []);

  const [orderNameError, setOrderNameError] = useState(null);
  const [quotationChange, setQuotationChange] = useState("");

  const [quotationImage, setQuotationImage] = useState([]);

  //   Handling the quotation images

  const handleQuotationImage = (event) => {
    const file = event.target.files[0];
    setQuotationImage((images) => [...images, file]);
  };
  useEffect(() => {
    console.log(quotationImage);
  }, [quotationImage]);

  useEffect(() => {
    console.log(quotationChange);
  }, [quotationChange]);

  const handleQuotationChange = (event) => {
    setQuotationChange(event.target.value);
  };

  const downloadHandler = async () => {
    if (quotationChange == "") return;
    const formData = new FormData();
    formData.append("operation", "fetchQuotationImage");
    formData.append("orderName", orderDetails.orderName);
    formData.append("quotation", quotationChange);
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      formData,
      {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${authUser.token}`,
        },
        responseType: "blob",
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
      const BillfileUrl = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element and click it to start the download
      const link = document.createElement("a");
      link.href = BillfileUrl;
      link.setAttribute(
        "download",
        response.headers["content-disposition"].split("filename=")[1]
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Media Queries
  const isXSScreen = useMediaQuery(`(max-width: 600px)`);
  const isMediumScreen = useMediaQuery(`(min-width: 600px)`);
  const isLargeScreen = useMediaQuery(`(min-width: 1200px)`);

  // Table Functions

  const [orderItems, setOrderItems] = useState([
    {
      id: 0,
      itemName: "",
      quantity: "",
      description: "",
    },
  ]);

  const createOrderItem = () => {
    if (
      orderItems.length != 0 &&
      orderItems[orderItems.length - 1].itemName == ""
    ) {
      return;
    }
    const newItem = {
      id: orderItems.length,
      itemName: "",
      quantity: "",
      description: "",
    };
    setOrderItems((items) => [...items, newItem]);
  };

  const itemValueChange = (event, item, operation) => {
    const newOrderItems = orderItems.map((oldItem) => {
      if (oldItem.id == item.id) {
        switch (operation) {
          case "itemName":
            return { ...oldItem, itemName: toTitleCase(event.target.value) };
          case "quantity":
            return { ...oldItem, quantity: event.target.value };
          case "description":
            return { ...oldItem, description: toTitleCase(event.target.value) };
        }
      }
      return { ...oldItem };
    });
    console.log("newOrderItems: ", newOrderItems);
    setOrderItems(newOrderItems);
  };

  const deleteOrderHandler = (e, item) => {
    const newOrderedItems = orderItems.filter(
      (oldItem) => oldItem.id != item.id
    );
    const updatedItems = newOrderedItems.map((items, index) => ({
      ...items,
      id: index,
    }));
    setOrderItems(updatedItems);
  };

  useEffect(() => {
    console.log(orderItems);
  }, [orderItems]);

  // Unique Order Name finder

  const orderNameErrorFinder = async () => {
    if (orderDetails.orderName == "") {
      return;
    }
    const formData = new FormData();
    formData.append("orderName", orderDetails.orderName.toLowerCase());
    formData.append("operation", "uniqueOrderName");
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      const result = response.data;
      if (result.Order_name) {
        setOrderNameError(true);
      } else {
        setOrderNameError(false);
      }
    }
  };

  const filterTheItems = () => {
    const newItems = orderItems.filter((items) => items.itemName != "");
    console.log(newItems);
    setOrderItems(newItems);
  };

  const checkForNull = () => {
    if (orderDetails.orderName == "" || orderDetails.orderDate == null) {
      return true;
    }
    filterTheItems();
    return false;
  };
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 1);

  const uploadOrder = async () => {
    console.log("OrderDetails: ", orderDetails);
    if (orderNameError == true) {
      alert("OrderName Already Exists");
    } else if (checkForNull() == true) {
      alert("Missing values");
    } else if (orderItems.length == 0) {
      alert("No items Found");
    }
    // setOrderDetails((details) => ({
    //   ...details,
    //   orderDate: new Date(
    //     details.orderDate.getTime() -
    //       details.orderDate.getTimezoneOffset() * 60 * 1000
    //   ),
    // }));

    const formData = new FormData();
    formData.append("orderDetails", JSON.stringify(orderDetails));
    formData.append("orderItems", JSON.stringify(orderItems));
    formData.append("noOfQuotations", quotationImage.length);
    formData.append("operation", "addOrder");
    const quotationImageNames = [];
    for (var i = 0; i < quotationImage.length; i++) {
      formData.append(`quotationImage${i}`, quotationImage[i]);
      quotationImageNames[i] = quotationImage[i].name;
    }
    console.log("quotationImageNames: ", quotationImageNames);
    formData.append("quotationImageNames", JSON.stringify(quotationImageNames));
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/orderAPI`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    }
  };

  return auth.currentUser ? (
    <Grid
      container
      sx={{ maxHeight: "100vh", overflowY: "auto", background: "#635985" }}
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
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: isXSScreen ? 0 : isMediumScreen ? 4 : 2,
          paddinBottom: isXSScreen ? 0 : isMediumScreen ? 4 : 2,
        }}
      >
        <Card
          sx={{
            width:
              isMediumScreen && !isLargeScreen
                ? "90%"
                : isXSScreen
                ? "100%"
                : "90%",
          }}
        >
          <CardContent>
            <Grid
              container
              spacing={5}
              sx={{
                display: "flex",
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Typography component="h3" variant="h3">
                  Order View
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: isXSScreen ? "flex-start" : "center",
                  flexDirection: isXSScreen ? "column" : "row",
                }}
                spacing={2}
              >
                {" "}
                <InputLabel
                  htmlFor=""
                  sx={{
                    color: "black",
                    minWidth: "fit-content",
                    // marginTop: orderNameError == null ? 2 : 0,
                  }}
                >
                  Order Name:{" "}
                </InputLabel>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: isXSScreen ? "5px" : "22px",
                    width: isXSScreen ? "100%" : "70%",
                  }}
                >
                  <TextField
                    disabled
                    variant="outlined"
                    placeholder=""
                    label="Order Name"
                    value={toTitleCase(orderDetails.orderName)}
                    sx={{
                      minWidth: isXSScreen ? "100%" : 250,
                      color: "black",
                    }}
                  ></TextField>
                  <span
                    style={{
                      color: orderNameError == true ? "red" : "green",
                      marginTop: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      visibility: orderNameError == null ? "hidden" : "visible",
                    }}
                  >
                    {orderNameError == null ? (
                      "SYED ERROR"
                    ) : orderNameError == true ? (
                      <>
                        <CloseIcon sx={{ fontSize: 18 }} /> OrderName already
                        exists
                      </>
                    ) : (
                      <>
                        <DoneIcon sx={{ fontSize: 18 }} /> OrderName doesn't
                        exist
                      </>
                    )}
                  </span>
                </span>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: isXSScreen ? "flex-start" : "center",
                  flexDirection: isXSScreen ? "column" : "row",
                  gap: isXSScreen ? 1 : 0,
                }}
              >
                <InputLabel
                  htmlFor=""
                  sx={{ color: "black", minWidth: "fit-content" }}
                >
                  Order Date:{" "}
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    disabled
                    // defaultCalendarMonth={defaultDate}
                    id="fromDateId"
                    inputFormat="DD/MM/YYYY"
                    value={orderDetails.orderDate}
                    renderInput={(params) => (
                      <TextField
                        inputProps={{
                          style: { border: "2px solid blue" },
                        }}
                        {...params}
                        sx={{
                          width: isXSScreen ? "100%" : "70%",
                          marginTop: isXSScreen ? "5px" : "0px",
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                <InputLabel htmlFor="" sx={{ color: "black" }}>
                  Upload Quotations:
                </InputLabel>
                <Grid
                  container
                  sx={{
                    display: "flex",
                    gap: isXSScreen ? 2 : 0,
                    justifyContent: "center",
                    paddingLeft: isMediumScreen ? "8vw" : isXSScreen ? 0 : 10,
                  }}
                >
                  <Grid item xs={12} sm={6} md={6} sx={{}}>
                    <FormControl
                      sx={{
                        // display: "flex",
                        // flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <InputLabel
                        id="quotationSelectId"
                        sx={
                          {
                            // fontSize: "16px",
                          }
                        }
                      >
                        Quotations
                      </InputLabel>

                      <Select
                        labelId="quotationSelectId"
                        id="demo-simple-select"
                        value={quotationChange}
                        label="Quotation"
                        placeholder="Quotation"
                        onChange={handleQuotationChange}
                        sx={{
                          minWidth: 150,
                          width: isXSScreen
                            ? "auto"
                            : isMediumScreen && !isLargeScreen
                            ? "70%"
                            : 400,
                        }}
                      >
                        {orderDetails.quotations.length > 0
                          ? orderDetails.quotations.map((file, index) => (
                              <MenuItem key={file} value={file}>
                                Quotation {index}
                              </MenuItem>
                            ))
                          : null}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={6}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Button
                      variant="outlined"
                      id="itemImageId"
                      component="label"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingTop: 1.8,
                        paddingBottom: 1.8,
                        justifyContent: "center",
                        // width: isXSScreen
                        //   ? "auto"
                        //   : isMediumScreen && !isLargeScreen
                        //   ? "70%"
                        //   : "50%",
                        fontSize: isXSScreen
                          ? "0.8rem"
                          : isMediumScreen && !isLargeScreen
                          ? "auto"
                          : "auto",
                        borderColor: "black",
                        color: "black",
                        "&:hover": {
                          background: "#000",
                          borderColor: "black",
                          color: "white",
                        },
                      }}
                      onClick={downloadHandler}
                    >
                      Download{" "}
                      <DownloadIcon
                        sx={{
                          marginLeft: 1,
                          fontSize: isXSScreen
                            ? "18px"
                            : isMediumScreen && !isLargeScreen
                            ? 16
                            : "auto",
                        }}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <TableContainer component={Paper} sx={{ width: "80%" }}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow sx={{ background: "black" }}>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 14, color: "white" }}
                        >
                          ITEM NAME
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 14, color: "white" }}
                        >
                          QUANTITY
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 14, color: "white" }}
                        >
                          DESCRIPTION
                        </TableCell>
                        {/* <TableCell
                          align="center"
                          sx={{ fontSize: 14, color: "white" }}
                        >
                          DELETE{" "}
                        </TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetails.items_name.length > 0 &&
                        orderDetails.items_name.map((item, index) => (
                          <TableRow
                            key={item}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell align="center">
                              <TextField value={item} disabled />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                value={orderDetails.quantities[index]}
                                disabled
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={orderDetails.description[index]}
                                disabled
                              />{" "}
                            </TableCell>
                            {/* <TableCell align="center">
                              <IconButton
                                sx={{
                                  marginLeft: 0,
                                  marginRight: 0,
                                }}
                                onClick={(e) => deleteOrderHandler(e, item)}
                              >
                                <DeleteIcon color="error" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ) : (
    <div></div>
  );
}

export default orderView;
