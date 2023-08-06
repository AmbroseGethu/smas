import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import AddLocationDialog from "./AddLocationDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import { userContext } from "@/pages/_app";
import { rootDirectory } from "./RootDirectory";

function AddLocationField({
  page,
  serialKey,
  locationValueHandler,
  handleInstallationReport,
  deleteInstallationFile,
  installationReport,
}) {
  const [location1, setLocation1] = useState([]);
  const [location2, setLocation2] = useState([]);
  const [location3, setLocation3] = useState([]);

  const { authUser } = useContext(userContext);

  const fetchLocation1 = async () => {
    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location: "base",
          serialKey: serialKey,
          page: "addLocation",
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("Response Data:");
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
        const temp = response.data;
        const locations = temp.map((location) => location.location1);
        console.log("Locations: ", locations);
        setLocation1(locations);
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  };
  const fetchLocation2 = async () => {
    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location: "location2",
          serialKey: serialKey,
          operation: "fetchLocation2",
          locations: selectedLocations,
          page: "addLocation",
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("Response Data:");
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
        const temp = response.data;
        const locations = temp.map((location) => location.location2);
        console.log("Locations: ", locations);
        setLocation2(locations);
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  };
  const fetchLocation3 = async () => {
    try {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location: "location3",
          serialKey: serialKey,
          operation: "fetchLocation3",
          locations: selectedLocations,
          page: "addLocation",
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("Response Data:");
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
        const temp = response.data;
        const locations = temp.map((location) => location.location3);
        console.log("Locations: ", locations);
        setLocation3(locations);
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  };
  useEffect(() => {
    console.log("serial key Fetched: ", serialKey);
    fetchLocation1();
  }, []);
  useEffect(() => {
    if (page == 2) {
      fetchLocation2();
    } else if (page == 3) {
      fetchLocation3();
    }
  }, [page]);

  // Location1
  const [selectedLocation1, setSelectedLocation1] = useState(null);
  const [selectedLocation2, setSelectedLocation2] = useState(null);
  const [selectedLocation3, setSelectedLocation3] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState({
    location1: "",
    location2: "",
    location3: "",
  });
  const handleLocation1Change = (e) => {
    console.log(e.target.value);
    setSelectedLocation1(e.target.value);
    setSelectedLocations((locations) => ({
      ...locations,
      location1: e.target.value,
    }));
  };
  const handleLocation2Change = (e) => {
    console.log(e.target.value);
    setSelectedLocation2(e.target.value);
    setSelectedLocations((locations) => ({
      ...locations,
      location2: e.target.value,
    }));
  };
  const handleLocation3Change = (e) => {
    console.log(e.target.value);
    setSelectedLocation3(e.target.value);
    setSelectedLocations((locations) => ({
      ...locations,
      location3: e.target.value,
    }));
  };

  const [location1DialogOpen, setLocation1DialogOpen] = useState(false);
  const [location2DialogOpen, setLocation2DialogOpen] = useState(false);
  const [location3DialogOpen, setLocation3DialogOpen] = useState(false);
  const locationDialogClose = (e) => {
    switch (e) {
      case "1":
        setLocation1DialogOpen(false);
        break;
      case "2":
        setLocation2DialogOpen(false);
        break;
      case "3":
        setLocation3DialogOpen(false);
        break;
      default:
        setLocation1DialogOpen(false);
        setLocation2DialogOpen(false);
        setLocation3DialogOpen(false);
    }
  };
  const locationDialogHandler = (e) => {
    switch (e) {
      case "1":
        setLocation1DialogOpen(true);
        break;
      case "2":
        setLocation2DialogOpen(true);
        break;
      case "3":
        setLocation3DialogOpen(true);
        break;
      default:
        setLocation1DialogOpen(true);
        setLocation2DialogOpen(true);
        setLocation3DialogOpen(true);
    }
  };

  const location1ResponseHandler = () => {
    fetchLocation1();
    setLocation1DialogOpen(false);
  };
  const location2ResponseHandler = () => {
    fetchLocation2();
    setLocation2DialogOpen(false);
  };
  const location3ResponseHandler = () => {
    fetchLocation3();
    setLocation3DialogOpen(false);
  };

  const deleteLocationHandler = async (e) => {
    if (e == "location1") {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location1: selectedLocation1,
          operation: "deleteLocation1",
          serialKey: serialKey,
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
        fetchLocation1();
      }
    } else if (e == "location2") {
      console.log("Delete location2 locations: ", selectedLocations);
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location2: selectedLocation2,
          operation: "deleteLocation2",
          serialKey: serialKey,
          locations: selectedLocations,
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
        fetchLocation2();
      }
    } else if (e == "location3") {
      console.log("Delete location3 locations: ", selectedLocations);
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/fetchLocations`,
        {
          location2: selectedLocation2,
          operation: "deleteLocation3",
          serialKey: serialKey,
          locations: selectedLocations,
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
        fetchLocation3();
      }
    }
  };
  useEffect(() => {
    console.log("selectedLocations: ", selectedLocations);
    locationValueHandler(selectedLocations);
  }, [selectedLocations]);

  return (
    <>
      {page == 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // background: "green",
            flexGrow: 1,
            paddingTop: 50,
            paddingBottom: 50,
            // border: "2px solid grey",
            margin: "50px 10px",
            borderRadius: "16px",
            background: "#fff",
            boxShadow:
              "inset 0px 0px 3px #b5b5b5,inset -0px -0px 3px #ffffff, 0px 0px 3px #b5b5b5, -0px -0px 3px #ffffff",
            border: "2px solid white",
          }}
        >
          <FormLabel
            for="location1Id"
            sx={{ color: "black", marginRight: 8, fontSize: 20 }}
          >
            Select Location 1:{" "}
          </FormLabel>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="location1Id">Location 1</InputLabel>
            <Select
              // defaultValue={}

              labelId="location1Label"
              id="location1Id"
              value={selectedLocation1}
              label="Location1"
              onChange={handleLocation1Change}
              sx={{
                width: 250,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <MenuItem
                value=""
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  // background: "lightgrey",
                }}
                onClick={() => locationDialogHandler("1")}
                MenuProps={{
                  MenuListProps: {
                    style: { maxHeight: "200px", overflowY: "auto" },
                  },
                }}
              >
                <AddIcon />
                Add New Location
              </MenuItem>

              {location1.map((location) => (
                <MenuItem
                  key={location}
                  value={location}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>{" "}
          <Tooltip title="Delete Location">
            <IconButton
              color="error"
              sx={{}}
              onClick={() => deleteLocationHandler("location1")}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
      {page == 2 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // background: "green",
            flexGrow: 1,
            paddingTop: 50,
            paddingBottom: 50,
            // border: "2px solid grey",
            margin: "50px 10px",
            borderRadius: "16px",
            background: "#fff",
            boxShadow:
              "inset 0px 0px 3px #b5b5b5,inset -0px -0px 3px #ffffff, 0px 0px 3px #b5b5b5, -0px -0px 3px #ffffff",
            border: "2px solid white",
          }}
        >
          <FormLabel
            for="location1Id"
            sx={{ color: "black", marginRight: 8, fontSize: 20 }}
          >
            Select Location 2:{" "}
          </FormLabel>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="location2Id">Location 2</InputLabel>
            <Select
              // defaultValue={}
              displayEmpty
              labelId="location2Label"
              id="location2Id"
              value={selectedLocation2}
              label="Location2"
              onChange={handleLocation2Change}
              sx={{
                width: 250,
                display: "flex",
                justifyContent: "center",
              }}
              MenuProps={{
                MenuListProps: {
                  style: { maxHeight: "200px", overflowY: "auto" },
                },
              }}
            >
              <MenuItem
                value=""
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  // background: "lightgrey",
                }}
                onClick={() => locationDialogHandler("2")}
              >
                <AddIcon />
                Add New Location
              </MenuItem>

              {location2.length > 0 &&
                location2.map((location) => (
                  <MenuItem
                    key={location}
                    value={location}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    {location}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>{" "}
          <Tooltip title="Delete Location">
            <IconButton
              color="error"
              sx={{}}
              onClick={() => deleteLocationHandler("location2")}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
      {page == 3 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // background: "green",
            flexGrow: 1,
            paddingTop: 50,
            paddingBottom: 50,
            // border: "2px solid grey",
            margin: "50px 10px",
            borderRadius: "16px",
            background: "#fff",
            boxShadow:
              "inset 0px 0px 3px #b5b5b5,inset -0px -0px 3px #ffffff, 0px 0px 3px #b5b5b5, -0px -0px 3px #ffffff",
            border: "2px solid white",
          }}
        >
          <FormLabel
            for="location3Id"
            sx={{ color: "black", marginRight: 8, fontSize: 20 }}
          >
            Select Location 3:{" "}
          </FormLabel>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="location3Id">Location 3</InputLabel>
            <Select
              // defaultValue={}

              labelId="location3Label"
              id="location3Id"
              value={selectedLocation3}
              label="Location3"
              onChange={handleLocation3Change}
              sx={{
                width: 250,
                display: "flex",
                justifyContent: "center",
              }}
              MenuProps={{
                MenuListProps: {
                  style: { maxHeight: "200px", overflowY: "auto" },
                },
              }}
            >
              <MenuItem
                value=""
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  // background: "lightgrey",
                }}
                onClick={() => locationDialogHandler("3")}
              >
                <AddIcon />
                Add New Location
              </MenuItem>

              {location3.map((location) => (
                <MenuItem
                  key={location}
                  value={location}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>{" "}
          <Tooltip title="Delete Location">
            <IconButton
              color="error"
              sx={{}}
              onClick={() => deleteLocationHandler("location3")}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
      {page == 4 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // background: "green",
            flexGrow: 1,
            paddingTop: 50,
            paddingBottom: 50,
            // border: "2px solid grey",
            margin: "50px 10px",
            borderRadius: "16px",
            background: "#fff",
            boxShadow:
              "inset 0px 0px 3px #b5b5b5,inset -0px -0px 3px #ffffff, 0px 0px 3px #b5b5b5, -0px -0px 3px #ffffff",
            border: "2px solid white",
          }}
        >
          <FormLabel
            for="location3Id"
            sx={{ color: "black", marginRight: 8, fontSize: 20 }}
          >
            Add Installation Report:{" "}
          </FormLabel>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            {/* <InputLabel id="installaionID">Installation Report</InputLabel> */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant={installationReport !== null ? "contained" : "outlined"}
                color={installationReport !== null ? "success" : "primary"}
                id="installationID"
                component="label"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {installationReport !== null ? (
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
                  onChange={handleInstallationReport}
                />
              </Button>
            </div>
          </FormControl>{" "}
          <Tooltip title="Delete Location">
            <IconButton color="error" sx={{}} onClick={deleteInstallationFile}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
      <AddLocationDialog
        handler={() => locationDialogClose("1")}
        openHandler={location1DialogOpen}
        serialKey={serialKey}
        location={1}
        responseHandler={location1ResponseHandler}
        locationValues={selectedLocations}
      />
      <AddLocationDialog
        handler={() => locationDialogClose("2")}
        openHandler={location2DialogOpen}
        serialKey={serialKey}
        location={2}
        responseHandler={location2ResponseHandler}
        locationValues={selectedLocations}
      />
      <AddLocationDialog
        handler={() => locationDialogClose("3")}
        openHandler={location3DialogOpen}
        serialKey={serialKey}
        location={3}
        responseHandler={location3ResponseHandler}
        locationValues={selectedLocations}
      />
    </>
  );
}

export default AddLocationField;
