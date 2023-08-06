import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Snackbar,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/Purchase.module.css";
// For DatePicker
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import styled from "@emotion/styled";
import { isDate } from "moment/moment";
import axios from "axios";
import { useRouter } from "next/router";
import { auth } from "@/components/Firebase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

const NumberField = styled(TextField)(({ theme }) => ({
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    display: "none",
  },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
}));

function purchase() {
  const router = useRouter();
  const { authUser, setAuthUser } = useContext(userContext);
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
  const initialValue = {
    serialKey: "",
    itemName: "",
    invoiceNo: "",
    invoiceDate: new Date().toDateString(),
    description: "",
    quantity: 1,
    ratePerQuantity: 0,
    rate: "",
    taxInPercentage: "",
    taxRate: "",
    totalRate: "",
    warranty: "",
    referenceNo: "",
    preOrdered: "true",
    duplicateInvoice: false,
  };
  const [values, setValues] = useState(initialValue);

  const [SerialKeyError, setSerialKeyError] = useState("");

  // TitleCase
  function toTitleCase(str) {
    return str

      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }
  // For the SnackBar
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setSerialKeyError("");
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const [billImage, setBillImage] = useState(null);
  const [itemImage, setItemImage] = useState(null);

  const handleBillImageChange = (event) => {
    // console.log(event.target.files[0]);
    const file = event.target.files[0];
    console.log("Bill image:", file);
    setBillImage(file);
  };
  const handleItemImageChange = (event) => {
    const file = event.target.files[0];
    console.log("Item Change: ", file);
    setItemImage(file);
  };

  const hasNullValues = () => {
    for (const key in values) {
      if (key == "duplicateInvoice") continue;
      if (values[key] == "" || values[key] == null) {
        // console.log("key: ", key, " Value: ", values[key]);
        return true;
      }
    }
    if (billImage == null || itemImage == null) {
      console.log("Image error: ");
      return true;
    }
    return false;
  };
  const [isInComplete, setIsInComplete] = useState("");

  const handleSubmit = async () => {
    setIsInComplete(hasNullValues);
  };

  // Testing to download images

  const [imageURL, setImageURL] = useState(null);
  const sendDataToPurchaseServer = async () => {
    const formData = new FormData();
    formData.append("billImage", billImage);
    console.log("BILL IMAGE PATH: ", billImage);
    formData.append("itemImage", itemImage);

    formData.append("values", JSON.stringify(values));
    console.log("USERNAME: ", authUser.details.Name);
    formData.append("user", authUser.details.Name);
    console.log("USER TOKEN: ", authUser.token);
    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/purchaseAPI`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log(response.data);
      if (response.data == "SerialKey Already Exists") {
        setSerialKeyError(response.data);
        setOpen(true);
      } else if (response.data == "success") {
        setSerialKeyError("Successfully Inserted..");
        setOpen(true);

        setValues(initialValue);
        setBillImage(null);
        setItemImage(null);
      } else if (response.data == -2) {
        setSerialKeyError("Invalid Request");
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Download try
  // const handleBillImageDownload = async () => {
  //   const formData = new FormData();
  //   const obj = {
  //     serialKey: 1,
  //   };
  //   formData.append("serialKey", 12);
  //   try {
  //     const response = await axios.post(
  //       `http://${rootDirectory}:3000/api/getBillImageApi`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "text/plain",
  //         },
  //         responseType: "blob",
  //       }
  //     );
  //     console.log(response);
  //     const BillfileUrl = window.URL.createObjectURL(new Blob([response.data]));

  //     // Create a link element and click it to start the download
  //     const link = document.createElement("a");
  //     link.href = BillfileUrl;
  //     link.setAttribute(
  //       "download",
  //       response.headers["content-disposition"].split("filename=")[1]
  //     );
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  // } catch (err) {
  //   console.log(err);
  // }
  // };

  useEffect(() => {
    // console.log(values);
    // console.log(isInComplete);
    if (isInComplete === true) {
      handleClick();
    } else if (isInComplete === false) {
      sendDataToPurchaseServer();
    }
    setIsInComplete("");
  }, [isInComplete]);
  useEffect(() => {
    console.log(values.itemImage);
  }, [values.itemImage]);

  useEffect(() => {
    setValues((values) => ({
      ...values,
      rate: values.quantity * values.ratePerQuantity,
    }));
  }, [values.quantity, values.ratePerQuantity]);
  useEffect(() => {
    setValues((values) => ({
      ...values,
      taxRate: (values.rate * values.taxInPercentage) / 100,
    }));
  }, [values.rate, values.taxInPercentage]);
  useEffect(() => {
    setValues((values) => ({
      ...values,
      totalRate: parseFloat(values.rate) + parseFloat(values.taxRate),
    }));
  }, [values.taxRate]);

  useEffect(() => {
    console.log(values);
  }, [values]);

  // Invoice feature

  const invoiceBlurHandler = async () => {
    if (values.invoiceNo != "") {
      console.log("User Token From AuthUser: ", authUser.token);
      const formData = new FormData();
      formData.append("operation", "checkInvoice");
      formData.append("invoiceNo", values.invoiceNo);
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/purchaseAPI`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("Invoice Data: ", response.data);
      if (response.data != "") {
        setBillImage(response.data.Bill_Image);

        setValues((values) => ({ ...values, duplicateInvoice: true }));
      } else if (response.data == -2) {
        setSerialKeyError("Error while verifying user..");
        setOpen(true);
      } else if (response.data == "" && values.duplicateInvoice == true) {
        setBillImage(null);
        setValues((values) => ({ ...values, duplicateInvoice: false }));
      } else if (response.data == -1) {
        setSerialKeyError("Error in API");
        setOpen(true);
      }
    }
  };

  return auth.currentUser ? (
    <Box component="div" className={styles.purchase__container}>
      {/* <button onClick={handleBillImageDownload}>Click to Download</button> */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        // action={action}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {SerialKeyError != "" ? SerialKeyError : "Fill All The Fields"}
        </Alert>
      </Snackbar>
      <Card>
        <CardContent>
          <center>
            <Typography
              variant="h4"
              color="black"
              sx={{
                marginTop: "10px",
                marginBottom: 5,
                fontWeight: "bold",
                fontFamily: "Montserrat, sans-serif ",
              }}
            >
              PURCHASE
            </Typography>
          </center>

          <Grid
            container
            spacing={2}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="serialKeyId"
                className={styles.purchase__inputLabel}
              >
                Serial Key:{" "}
              </InputLabel>

              <TextField
                value={values.serialKey}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    serialKey: e.target.value,
                  }))
                }
                variant="outlined"
                id="serialKeyId"
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="itemNameId"
                className={styles.purchase__inputLabel}
              >
                Item Name:{" "}
              </InputLabel>
              <TextField
                value={values.itemName}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    itemName: toTitleCase(e.target.value),
                  }))
                }
                variant="outlined"
                id="itemNameId"
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="invoiceNoId"
                className={styles.purchase__inputLabel}
              >
                Invoice No:{" "}
              </InputLabel>
              <NumberField
                value={values.invoiceNo}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    invoiceNo: e.target.value,
                  }))
                }
                variant="outlined"
                id="invoiceNoId"
                type="number"
                onBlur={invoiceBlurHandler}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="DateId"
                className={styles.purchase__inputLabel}
              >
                Enter Date:{" "}
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  id="DateId"
                  inputFormat="DD/MM/YYYY"
                  value={values.invoiceDate}
                  onChange={(newValue) => {
                    setValues((values) => ({
                      ...values,
                      invoiceDate: newValue,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      inputProps={{
                        style: { border: "2px solid blue" },
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
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="descriptionId"
                className={styles.purchase__inputLabel}
              >
                Description:{" "}
              </InputLabel>
              <TextField
                value={values.description}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    description: e.target.value,
                  }))
                }
                variant="outlined"
                multiline
                maxRows={3}
                id="descriptionId"
              />
            </Grid>
            {/* <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="quantityId"
                className={styles.purchase__inputLabel}
              >
                Quantity:{" "}
              </InputLabel>
              <NumberField
                value={values.quantity === 0 ? null : values.quantity}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    quantity: e.target.value,
                  }))
                }
                variant="outlined"
                type="number"
                id="quantityId"
                className={styles.purchase__numberInput}
              />
            </Grid> */}
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="ratePerQuantityId"
                className={styles.purchase__inputLabel}
              >
                Rate per Quantity:{" "}
              </InputLabel>
              <NumberField
                value={
                  values.ratePerQuantity == 0 ? null : values.ratePerQuantity
                }
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    ratePerQuantity: e.target.value,
                  }))
                }
                variant="outlined"
                type="number"
                id="ratePerQuantityId"
                className={styles.purchase__numberInput}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="rateId"
                className={styles.purchase__inputLabel}
              >
                Rate:{" "}
              </InputLabel>
              <NumberField
                value={values.rate}
                variant="outlined"
                type="number"
                id="rateId"
                disabled
                className={styles.purchase__numberInput}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="taxId"
                className={styles.purchase__inputLabel}
              >
                Tax in %:{" "}
              </InputLabel>
              <NumberField
                value={values.taxInPercentage}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    taxInPercentage: e.target.value,
                  }))
                }
                variant="outlined"
                type="number"
                id="taxId"
                className={styles.purchase__numberInput}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="taxRateId"
                className={styles.purchase__inputLabel}
              >
                Tax Rate:{" "}
              </InputLabel>
              <NumberField
                value={(values.rate * values.taxInPercentage) / 100}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    taxRate: (values.rate * values.taxInPercentage) / 100,
                  }))
                }
                variant="outlined"
                type="number"
                id="taxRateId"
                disabled
                className={styles.purchase__numberInput}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="totalRateId"
                className={styles.purchase__inputLabel}
              >
                Total Rate:{" "}
              </InputLabel>
              <NumberField
                value={values.totalRate}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    totalRate: e.target.value,
                  }))
                }
                variant="outlined"
                type="number"
                id="totalRateId"
                disabled
                className={styles.purchase__numberInput}
              />
            </Grid>
            {/* <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="warrantyId"
                className={styles.purchase__inputLabel}
              >
                Warranty:{" "}
              </InputLabel>
              <NumberField
                value={values.warranty}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    warranty: e.target.value,
                  }))
                }
                variant="outlined"
                type="number"
                id="warrantyId"
                label="In Months"
                className={styles.purchase__numberInput}
              />
            </Grid> */}
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="warrantyId"
                className={styles.purchase__inputLabel}
              >
                Warranty in Months:{" "}
              </InputLabel>
              <TextField
                type="number"
                value={values.warranty}
                onChange={(newValue) => {
                  setValues((values) => ({
                    ...values,
                    warranty: newValue.target.value,
                  }));
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="referenceNoId"
                className={styles.purchase__inputLabel}
              >
                Reference No:{" "}
              </InputLabel>
              <TextField
                value={values.referenceNo}
                onChange={(e) =>
                  setValues((values) => ({
                    ...values,
                    referenceNo: e.target.value,
                  }))
                }
                variant="outlined"
                id="referenceNoId"
                className={styles.purchase__numberInput}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="itemImageId"
                className={styles.purchase__inputLabel}
              >
                ITEM Image:{" "}
              </InputLabel>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant={itemImage !== null ? "contained" : "outlined"}
                  color={itemImage !== null ? "success" : "primary"}
                  id="itemImageId"
                  component="label"
                  sx={{
                    color: itemImage !== null ? "white" : "hotpink",
                    background: itemImage !== null ? "hotpink" : "transparent",
                    // color: "white",
                    border: "1px solid hotpink",
                    "&:hover": {
                      background: itemImage !== null ? "#FF91C5" : "#FF91C5",
                      border: "1px solid hotpink",
                      color: "white",
                    },
                  }}
                >
                  {itemImage !== null ? (
                    <>
                      Uploaded
                      <span style={{ marginLeft: 5 }}>
                        <FileDownloadDoneIcon />
                      </span>
                    </>
                  ) : (
                    "Upload"
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleItemImageChange}
                  />
                </Button>
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <InputLabel
                htmlFor="billImageId"
                className={styles.purchase__inputLabel}
              >
                BILL Image:{" "}
              </InputLabel>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant={billImage !== null ? "contained" : "outlined"}
                  // color={billImage !== null ? "success" : "primary"}

                  id="billImageId"
                  component="label"
                  sx={{
                    color: billImage !== null ? "white" : "hotpink",
                    background: billImage !== null ? "hotpink" : "transparent",
                    // color: "white",
                    border: "1px solid hotpink",
                    "&:hover": {
                      background: billImage !== null ? "#FF91C5" : "#FF91C5",
                      border: "1px solid hotpink",
                      color: "white",
                    },
                  }}
                >
                  {billImage !== null ? (
                    <>
                      Uploaded
                      <span style={{ marginLeft: 5 }}>
                        <FileDownloadDoneIcon />
                      </span>
                    </>
                  ) : (
                    "Upload"
                  )}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleBillImageChange}
                  />
                </Button>
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "space-between",
              }}
            >
              <InputLabel className={styles.purchase__inputLabel}>
                PreOrdered?{" "}
              </InputLabel>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  aria-label="Platform"
                  value={values.preOrdered}
                  onChange={(e) =>
                    setValues((values) => ({
                      ...values,
                      preOrdered: e.target.value,
                    }))
                  }
                >
                  <ToggleButton value="true">Yes</ToggleButton>
                  <ToggleButton value="false">No</ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Grid>
          </Grid>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                width: "200px",
                background: "hotpink ",
                "&:hover": { background: "#FF91C5  " },
              }}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </Box>
  ) : (
    <div></div>
  );
}

export default purchase;
