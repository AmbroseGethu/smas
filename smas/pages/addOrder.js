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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { toTitleCase } from "@/components/TitleCase";
import { useRouter } from "next/router";
import { auth } from "@/components/Firebase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

function addOrder() {
  const router = useRouter();
  const { authUser } = useContext(userContext);
  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, []);
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
  });

  const [orderNameError, setOrderNameError] = useState(null);
  const [quotationChange, setQuotationChange] = useState("");

  const [quotationImage, setQuotationImage] = useState([]);

  //   Handling the quotation images

  const handleQuotationImage = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setQuotationImage((images) => [...images, file]);
    }
  };
  useEffect(() => {
    console.log(quotationImage);
  }, [quotationImage]);

  useEffect(() => {
    console.log(quotationChange);
  }, [quotationChange]);

  const handleQuotationChange = (event) => {
    if (event.target.value == "none") {
      return;
    }
    setQuotationChange(event.target.value);
  };

  const quotationImageDelete = () => {
    if (quotationChange == "none") return;
    const images = quotationImage.filter((img) => {
      return img.name !== quotationChange;
    });
    setQuotationImage(images);
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
      description: "none",
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
    const result = response.data;
    if (result == -2) {
      setSnackMessage("Error verifying user..");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (result == -1) {
      setSnackMessage("Error in API..");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (result.Order_name) {
      setOrderNameError(true);
    } else {
      setOrderNameError(false);
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
    } else {
      router.push("/order");
    }
  };

  return auth.currentUser ? (
    <Grid
      container
      sx={{
        maxHeight: "100vh",
        overflowY: "auto",
        background: "#3A98B9",
        paddingTop: "10px",
        paddingBottom: "40px",
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
            background: "#fff",
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
                  marginTop: "20px",
                }}
              >
                <Typography component="h4" variant="h4">
                  New Order
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
                  Order ID:{" "}
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
                    variant="outlined"
                    placeholder="123456789"
                    value={orderDetails.orderName}
                    onChange={(e) => {
                      setOrderNameError(null);
                      setOrderDetails((details) => ({
                        ...details,
                        orderName: toTitleCase(e.target.value),
                      }));
                    }}
                    onBlur={orderNameErrorFinder}
                    sx={{
                      minWidth: isXSScreen ? "100%" : 250,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "black",
                        },
                        "&:hover fieldset": {
                          borderColor: "black",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "black",
                      },
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
                    // defaultCalendarMonth={defaultDate}
                    id="fromDateId"
                    inputFormat="DD/MM/YYYY"
                    value={orderDetails.orderDate}
                    onChange={(newValue) => {
                      setOrderDetails((details) => ({
                        ...details,
                        orderDate: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        inputProps={{
                          style: { border: "2px solid blue" },
                        }}
                        {...params}
                        sx={{
                          width: isXSScreen ? "100%" : "70%",
                          marginTop: isXSScreen ? "5px" : "0px",
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "black",
                            },
                            "&:hover fieldset": {
                              borderColor: "black",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "black",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "black",
                          },
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
                <InputLabel
                  htmlFor=""
                  sx={{ color: "black", marginLeft: "30px" }}
                >
                  Upload Quotations:
                </InputLabel>
                <Grid
                  container
                  sx={{
                    display: "flex",

                    justifyContent: "center",
                  }}
                >
                  <Grid
                    item
                    xs={6}
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
                        alignItems: "center",
                        width: isXSScreen
                          ? "auto"
                          : isMediumScreen && !isLargeScreen
                          ? "70%"
                          : "50%",
                        fontSize: isXSScreen ? "0.8rem" : "auto",
                        borderColor: "black",
                        color: "black",
                        "&:hover": {
                          background: "#000",
                          color: "white",
                          borderColor: "black",
                        },
                      }}
                    >
                      Upload{" "}
                      <AddIcon sx={{ marginLeft: 1, fontSize: "20px" }} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleQuotationImage}
                      />
                    </Button>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={6}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <FormControl
                      sx={{
                        display: "flex",
                        flexDirection: "row",
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
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "black",
                            },
                            "&:hover fieldset": {
                              borderColor: "black",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "black",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "black",
                          },
                        }}
                      >
                        {quotationImage.length == 0 && (
                          <MenuItem value={"none"}>
                            No Quotations Uploaded
                          </MenuItem>
                        )}
                        {quotationImage.length > 0
                          ? quotationImage.map((file) => (
                              <MenuItem key={file.name} value={file.name}>
                                {file.name}
                              </MenuItem>
                            ))
                          : null}
                      </Select>
                      <IconButton
                        color="error"
                        onClick={quotationImageDelete}
                        sx={{ marginLeft: 1, marginRight: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </FormControl>
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
                        <TableCell
                          align="center"
                          sx={{ fontSize: 14, color: "white" }}
                        >
                          DELETE{" "}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.length > 0 &&
                        orderItems.map((item) => (
                          <TableRow
                            key={item.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell align="center">
                              <TextField
                                value={item.itemName}
                                onChange={(e) =>
                                  itemValueChange(e, item, "itemName")
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  itemValueChange(e, item, "quantity")
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={item.description}
                                onChange={(e) =>
                                  itemValueChange(e, item, "description")
                                }
                              />{" "}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                sx={{
                                  marginLeft: 0,
                                  marginRight: 0,
                                }}
                                onClick={(e) => deleteOrderHandler(e, item)}
                              >
                                <DeleteIcon color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div style={{ width: "80%" }}>
                  {/* <Button
                    onClick={createOrderItem}
                    variant="contained"
                    sx={{ background: "" }}
                  >
                    Add New Item <AddIcon />
                  </Button> */}
                  <IconButton
                    onClick={createOrderItem}
                    variant="contained"
                    sx={{
                      background: "black",
                      "&:hover": { background: "#333" },
                      color: "white",
                      marginRight: 1.5,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  New Item
                </div>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 0,
                  marginTop: "-10px",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    background: "black",
                    "&:hover": { background: "#333" },
                  }}
                  onClick={uploadOrder}
                >
                  Upload Order
                </Button>
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

export default addOrder;
