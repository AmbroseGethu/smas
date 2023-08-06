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
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
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
import { parseISO, subDays } from "date-fns";
import Link from "next/link";
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

function editItem() {
  const router = useRouter();
  const { skey } = router.query;
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

  const [values, setValues] = useState({
    serialKey: "",
    itemName: "",
    invoiceNo: "",
    invoiceDate: new Date().toDateString(),
    description: "",
    quantity: 0,
    ratePerQuantity: 0,
    rate: "",
    taxInPercentage: "",
    taxRate: "",
    totalRate: "",
    warranty: "",
    referenceNo: "",
    preOrdered: "true",
    duplicateInvoice: false,
  });

  // SnackBar

  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");
  const [snackMessage, setSnackMessage] = useState("");
  const handlerSnackClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
  };

  const fetchDetails = async (skey) => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getItemDetails`,
      {
        condition: "Invoice",
        serialKey: skey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == -1) {
      setSerialKeyError("Error In API");
      setOpen(true);
    } else if (response.data == -2) {
      setSerialKeyError("User Verification Error..");
      setOpen(true);
    } else {
      const details = response.data[0];
      const dateString = details.Date;
      const date = parseISO(dateString);
      const subtractedDate = subDays(date, 1);

      setValues((values) => ({
        serialKey: skey,
        itemName: details.Item_name,
        invoiceNo: details.Invoice_no,
        invoiceDate: subtractedDate,
        description: details.Description,
        rate: details.Rate,
        ratePerQuantity: details.RatePerQuantity,
        quantity: details.Quantity,
        taxInPercentage: parseInt(details.Tax),
        warranty: details.Warranty,
        referenceNo: details.Reference_no,
        preOrdered: details.PreOrdered ? "true" : "false",
      }));
    }
  };

  const [isUsed, setIsUsed] = useState(true);
  const fetchUsageDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getItemDetails`,
      {
        condition: "getUsed",
        serialKey: skey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    if (response.data == -1) {
      setSerialKeyError("Error in API");
      setOpen(true);
    } else if (response.data == -2) {
      setSerialKeyError("User Verification Failed...");
      setOpen(true);
    } else {
      setIsUsed(response.data);
    }
  };

  useEffect(() => {
    if (skey) {
      fetchDetails(skey);
      fetchUsageDetails();
    }
  }, [skey]);

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
    const file = event.target.files[0];
    console.log("Bill image:");
    setBillImage(file);
  };
  const handleItemImageChange = (event) => {
    const file = event.target.files[0];

    setItemImage(file);
  };

  const hasNullValues = () => {
    const nullKeys = [];
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === undefined || value === "") {
        nullKeys.push(key);
      }
    }
    if (nullKeys.length == 0) {
      return false;
    }
    return true;
  };
  const [isInComplete, setIsInComplete] = useState("");

  const handleSubmit = async () => {
    setIsInComplete(hasNullValues);
  };

  // Testing to download images
  const redirectME = () => {
    setTimeout(() => {
      router.push("/items");
    }, 1000);
  };

  const [imageURL, setImageURL] = useState(null);
  const sendDataToPurchaseServer = async () => {
    console.log(values);
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/editItemAPI`,
      {
        condition: "updateItemDetails",
        formDetails: JSON.stringify(values),
        user: authUser.details.Name,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    if (response.data === 1) {
      setSnackMessage("Saved changes..");
      setSnackSeverity("success");
      setSnackBar(true);
      redirectME();
      // router.push("/items");
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed...");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
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
      totalRate: values.rate + values.taxRate,
    }));
  }, [values.taxRate]);

  // Invoice feature

  const invoiceBlurHandler = async () => {
    if (values.invoiceNo != "") {
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
      <Card>
        <CardContent>
          <center>
            <Typography
              variant="h4"
              color="black"
              sx={{
                marginBottom: 5,
                fontWeight: "bold",
                fontFamily: "Montserrat, sans-serif ",
              }}
            >
              EDIT ITEM
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
                disabled
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
                disabled
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
                  disabled
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
                htmlFor="ratePerQuantityId"
                className={styles.purchase__inputLabel}
              >
                Rate per Quantity:{" "}
              </InputLabel>
              <NumberField
                value={
                  values.ratePerQuantity === 0 ? null : values.ratePerQuantity
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
              lg={isUsed ? 4 : 6}
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
            {isUsed && (
              <Grid
                item
                xs={12}
                md={6}
                lg={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <InputLabel
                  htmlFor="locationChangeId"
                  className={styles.purchase__inputLabel}
                >
                  Change Location:
                </InputLabel>
                <Link
                  href={{
                    pathname: "/addLocation",
                    query: { serialKey: skey },
                  }}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      background: "#E74646",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&:hover": {
                        background: "#B32020",
                      },
                    }}
                  >
                    <EditLocationAltIcon sx={{ fontSize: "20px" }} /> Change
                    Location
                  </Button>
                </Link>
              </Grid>
            )}
            <Grid
              item
              xs={12}
              md={6}
              lg={isUsed ? 4 : 6}
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
              color="primary"
              onClick={handleSubmit}
              sx={{ width: "200px" }}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </Box>
  ) : (
    <div></div>
  );
}

export default editItem;
