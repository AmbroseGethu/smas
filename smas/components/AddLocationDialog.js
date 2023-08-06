import { userContext } from "@/pages/_app";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { rootDirectory } from "./RootDirectory";

function AddLocationDialog({
  serialKey,
  handler,
  openHandler,
  location,
  responseHandler,
  locationValues,
}) {
  const [location1, setLocation1] = useState("");
  const [location2, setLocation2] = useState("");
  const [location3, setLocation3] = useState("");

  const { authUser } = useContext(userContext);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  useEffect(() => {
    console.log(locationValues);
  }, [locationValues]);

  // Focus on textField
  const focusUsernameInputField = (input) => {
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  };

  const locationAdder = async () => {
    if (location == 1) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location: location,
          location1: location1,
          operation: "addlocation1",
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
        responseHandler();
      }
      setLocation1("");
    } else if (location == 2) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location: location,
          location1: locationValues.location1,
          location2: location2,
          operation: "addlocation2",
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
        responseHandler();

        setLocation1("");
        setLocation2("");
      }
    } else if (location == 3) {
      console.log(locationValues);
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          locations: locationValues,
          location3: location3,
          operation: "addlocation3",
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
        responseHandler();

        setLocation1("");
        setLocation2("");
        setLocation3("");
      }
    }
  };

  // TitleCase
  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  return (
    <>
      <Dialog
        onClose={handler}
        open={openHandler}
        sx={{
          height: 500,
          overflowY: "scroll",
          scrollBehavior: "smooth",
        }}
        fullWidth="false"
        maxWidth={"xs"}
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
        <List sx={{ margin: "40px" }}>
          <ListSubheader
            sx={{
              padding: "5px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              paddingBottom: 2,
            }}
          >
            <Typography
              component="h6"
              variant="h6"
              color="black"
              sx={{ marginRight: 2, marginBottom: 1 }}
            >
              Add Location {location}:
            </Typography>
            {/* <Autocomplete
                onChange={(event, newValue) => selectTheSerialKey(newValue)}
                freeSolo
                id="serialKeySearchBox"
                disableClearable
                options={serialKeys}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Serial Key"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
                sx={{ width: 200 }}
                //   className={styles.item__inputField}
              /> */}
            <TextField
              inputRef={focusUsernameInputField}
              variant="outlined"
              placeholder={`Location ${location}`}
              value={
                location == 1
                  ? location1
                  : location == 2
                  ? location2
                  : location3
              }
              onChange={(e) => {
                location == 1
                  ? setLocation1(toTitleCase(e.target.value))
                  : location == 2
                  ? setLocation2(toTitleCase(e.target.value))
                  : setLocation3(toTitleCase(e.target.value));
              }}
            />
            <Button
              variant="contained"
              sx={{
                background: "hotpink",
                marginTop: 2,
                ":hover": { background: "#FE019A" },
              }}
              disabled={
                location == 1 && location1 == ""
                  ? true
                  : location == 2 && location2 == ""
                  ? true
                  : location == 3 && location3 == ""
                  ? true
                  : false
              }
              onClick={locationAdder}
            >
              Add Location
            </Button>
          </ListSubheader>
        </List>
      </Dialog>
    </>
  );
}

export default AddLocationDialog;
