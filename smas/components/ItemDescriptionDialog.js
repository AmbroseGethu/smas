import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { userContext } from "@/pages/_app";
import Link from "next/link";
import { rootDirectory } from "./RootDirectory";

function ItemDescriptionDialog({
  handler,
  openHandler,
  serialKey,
  itemNavActive,
  itemStatusHandler,
  // accessibility,
}) {
  // alert("serialkey: ", serialKey, " itemNavActive: ", itemNavActive);
  const [itemPurchaseDetails, setItemPurchaseDetails] = useState("");
  const [itemDetails, setItemDetails] = useState([]);
  const [itemLocationDetails, setItemLocationDetails] = useState(null);
  const [itemStatus, setItemStatus] = useState("");

  useEffect(() => {
    itemStatusHandler();
  }, [itemStatus]);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
  };

  const [access, setAccess] = useState(0);

  const getAccessibility = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/user`,
      {
        token: authUser.token,
        serialKey: serialKey,
        condition: "fetchAccessibility",
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data == 1 || response.data == 0) {
      setAccess(response.data);
    } else if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    }
  };

  const getLocationDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchLocations`,
      {
        operation: "fetchLocation",
        serialKey: serialKey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    console.log("Location: ", response.data);
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      setItemLocationDetails(response.data);
    }
  };

  const getPurchaseDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getItemDetails`,
      {
        serialKey: serialKey,
        condition: "Invoice",
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
      setItemPurchaseDetails(response.data);
    }
  };
  const getItemDetails = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/getItemDetails`,
      {
        serialKey: serialKey,
        condition: "Item",
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    const resData = response.data;
    if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      setItemDetails(resData);
      setItemStatus(resData[0]?.Condition);
    }
  };

  useEffect(() => {
    if (serialKey) {
      if (authUser.details.Designation == "Staff") {
        getAccessibility();
      } else {
        setAccess(1);
      }
      getPurchaseDetails();
      getItemDetails();
      getLocationDetails();
    }
  }, [serialKey]);

  const ItemStatusOptions = [
    "Working",
    "Condemn",
    "Not Working",
    "Transferred",
    "Not Used",
  ];

  const router = useRouter();

  const handleItemStatusChange = async (event) => {
    if (event.target.value == "Working") {
      // alert(serialKey);
      router.push({
        pathname: "/addLocation",
        query: { serialKey },
      });
    } else {
      const prompt = window.prompt(
        `Need to change the item to ${event.target.value}`
      );
      if (prompt && prompt.toLowerCase() == "yes") {
        try {
          const response = await axios.post(
            `http://${rootDirectory}:3000/api/fetchLocations`,
            {
              operation: "removeLocation",
              condition: event.target.value,
              serialKey: serialKey,
              accessingUser: authUser.details.Name,
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
            alert(event.target.value);
            setItemStatus(event.target.value);
            getItemDetails();
          }
        } catch (err) {
          console.log(err);
        }
      }
    }

    // const answer = window.prompt(
    //   `Do you need to change the status to ${event.target.value}? (Yes/No)`
    // );
    // if (answer && answer.toLowerCase() == "yes")
  };

  const downloadInvoice = async () => {
    const formData = new FormData();

    formData.append("serialKey", serialKey);
    formData.append("imageNeeded", "bill");
    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/getImageApi`,
        formData,
        {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${authUser.token}`,
          },
          responseType: "blob",
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
        const BillfileUrl = window.URL.createObjectURL(
          new Blob([response.data])
        );

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
    } catch (err) {
      console.log(err);
    }
  };

  const downloadItemImage = async () => {
    const formData = new FormData();

    formData.append("serialKey", serialKey);
    formData.append("imageNeeded", "item");

    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/getImageApi`,
        formData,
        {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${authUser.token}`,
          },
          responseType: "blob",
        }
      );
      console.log(response);
      if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (response.data == -2) {
        setSnackMessage("User Verification Failed");
        setSnackSeverity("error");
        setSnackBar(true);
      } else {
        const BillfileUrl = window.URL.createObjectURL(
          new Blob([response.data])
        );

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
    } catch (err) {
      console.log(err);
    }
  };

  const downloadInstallationReport = async () => {
    const formData = new FormData();

    formData.append("serialKey", serialKey);
    formData.append("imageNeeded", "installationReport");

    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/getImageApi`,
        formData,
        {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${authUser.token}`,
          },
          responseType: "blob",
        }
      );
      console.log(response);
      if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (response.data == -2) {
        setSnackMessage("User Verification Failed");
        setSnackSeverity("error");
        setSnackBar(true);
      } else {
        const BillfileUrl = window.URL.createObjectURL(
          new Blob([response.data])
        );

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
    } catch (err) {
      console.log(err);
    }
  };

  // Request Access
  const { authUser } = useContext(userContext);
  const requestAccess = async () => {
    if (window.confirm("Are you sure to request access for this item?")) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/accessRequest`,
        {
          serialKey: serialKey,
          condition: "requestAccess",
          userToken: authUser.token,
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
      }
    }
  };

  // Edit Item Handler

  const editItemHandler = () => {};

  // Delete item Handler

  const deleteItemHandler = async () => {
    if (window.prompt("Type CONFIRM to delete the item") == "CONFIRM") {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/getItemDetails`,
        {
          condition: "delete",
          serialKey: serialKey,
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
      } else if (response.data == "deleted") {
        handler(false);
      }
    }
  };

  return (
    <>
      <Dialog
        onClose={handler}
        open={openHandler}
        sx={{
          height: "80vh",
          overflowY: "scroll",
          scrollBehavior: "smooth",
        }}
        fullWidth="false"
        maxWidth={"sm"}
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
        {itemDetails.length == 0 ? (
          <Card>
            <CardContent
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                height: 100,
              }}
            >
              No Components Found
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ overflowY: "scroll  ", scrollBehavior: "smooth" }}>
            <CardContent>
              <List>
                <ListItem sx={{ display: "flex", justifyContent: "center" }}>
                  <Image
                    src={`/pngImages/${itemDetails[0]?.Item_name.toLowerCase()}.png`}
                    width={80}
                    height={80}
                  />
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Component Name:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {itemDetails[0]?.Item_name}
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Serial Number:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {serialKey}
                    </Grid>
                  </Grid>
                </ListItem>
                {itemNavActive === "new" ? null : (
                  <ListItem sx={{ marginBottom: 2 }}>
                    <Grid container>
                      <Grid item xs={6}>
                        Location:
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        {itemLocationDetails &&
                          itemLocationDetails[0]?.location1}{" "}
                        &rarr;{" "}
                        {itemLocationDetails &&
                          itemLocationDetails[0]?.location2}{" "}
                        {itemLocationDetails &&
                          itemLocationDetails[0]?.location3?.length > 0 && (
                            <>
                              &rarr;{" "}
                              {itemLocationDetails &&
                                itemLocationDetails[0]?.location3}
                            </>
                          )}
                      </Grid>
                    </Grid>
                  </ListItem>
                )}
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      Status:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="demo-select-small">Status</InputLabel>
                        <Select
                          defaultValue={itemStatus}
                          labelId="demo-select-small"
                          id="demo-select-small"
                          value={itemStatus}
                          label="Age"
                          onChange={handleItemStatusChange}
                        >
                          {ItemStatusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </ListItem>
                {/* <ListItem sx={{ marginBottom: 2 }}>
                <Grid container>
                  <Grid item xs={6}>
                    Location:
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    StaffRoom &rarr; Mr. Arulalan
                  </Grid>
                </Grid>
              </ListItem> */}
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Warranty:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {itemPurchaseDetails[0]?.Warranty} months
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Download Item Image:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button variant="contained" onClick={downloadItemImage}>
                        Download
                      </Button>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider sx={{ margin: "20px auto" }} />
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <h3>Invoice Details</h3>
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Invoice No:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {itemPurchaseDetails[0]?.Invoice_no}
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Invoice Date:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {itemPurchaseDetails[0]?.Date?.substring(0, 10)}
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem sx={{ marginBottom: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      Download Invoice:
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button variant="contained" onClick={downloadInvoice}>
                        Download
                      </Button>
                    </Grid>
                  </Grid>
                </ListItem>
                {itemNavActive == "used" && (
                  <>
                    <Divider sx={{ margin: "20px auto" }} />
                    <ListItem sx={{ marginBottom: 2 }}>
                      <Grid container>
                        <Grid item xs={6}>
                          Download Installation Report:
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sx={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            variant="contained"
                            onClick={downloadInstallationReport}
                          >
                            Download
                          </Button>
                        </Grid>
                      </Grid>
                    </ListItem>
                  </>
                )}
                <Divider sx={{ margin: "20px auto" }} />

                <ListItem
                  sx={{ display: "flex", justifyContent: "center", gap: 3 }}
                >
                  {access == 0 && (
                    <Button
                      variant="contained"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                      onClick={requestAccess}
                    >
                      Request Access <EditIcon sx={{ fontSize: 20 }} />
                    </Button>
                  )}
                  {access == 1 && (
                    <>
                      <Link
                        href={{
                          pathname: "/editItem",
                          query: { skey: serialKey },
                        }}
                        style={{ textDecoration: "none" }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                            alignItems: "center",
                            textDecoration: "none",
                          }}

                          // onClick={editItemHandler}
                        >
                          Edit <EditIcon sx={{ fontSize: 20 }} />
                        </Button>{" "}
                      </Link>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={deleteItemHandler}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        Delete <DeleteForeverIcon sx={{ fontSize: 20 }} />
                      </Button>
                    </>
                  )}
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}
      </Dialog>
    </>
  );
}

export default ItemDescriptionDialog;
