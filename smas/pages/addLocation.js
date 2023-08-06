import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  Divider,
  FormLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import AddLocationField from "@/components/AddLocationField";
import axios from "axios";
import { auth } from "@/components/Firebase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

function addLocation() {
  const router = useRouter();
  const { authUser } = useContext(userContext);
  const [serialKey, setSerialKey] = useState("");

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
    console.log(router.query);
    if (!auth.currentUser) {
      router.push("/login");
    }
    if (!router.query.serialKey) {
      router.push("/items");
    }
    setSerialKey(router.query.serialKey);
  }, []);
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

  //Stepper
  const steps = [
    "Location 1",
    "Location 2",
    "Location 3",
    " Installation Report",
  ];
  const [selectedLocations, setSelectedLocations] = useState({
    location1: "",
    location2: "",
    location3: "",
  });

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const locationValueHandler = (e) => {
    setSelectedLocations(e);
    console.log("Locations retrieved: ", e);
  };

  // Location adder

  const confirmLocation = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/fetchLocations`,
      {
        operation: "addItemLocation",
        locations: selectedLocations,
        serialKey: serialKey,
        user: authUser.details.Name,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );

    if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -1) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    } else {
      setOpen(true);
      const formData = new FormData();
      formData.append("installationReport", installationReport);
      formData.append("values", JSON.stringify({ serialKey: serialKey }));
      const installationReponse = await axios.post(
        `http://${rootDirectory}:3000/api/addInstallationReport`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      if (response.data == -2) {
        setSnackMessage("User Verification Failed");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackSeverity("error");
        setSnackBar(true);
      } else {
        router.push("/items");
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    if (activeStep === steps.length) {
      confirmLocation();
    }
  }, [activeStep]);

  const isStepOptional = (step) => {
    // return step === 1;
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (activeStep === steps.length - 1) {
      if (window.confirm("Are you sure to add location?")) {
        if (isStepSkipped(activeStep)) {
          newSkipped = new Set(newSkipped.values());
          newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
      }
    } else {
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }

      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // InstallationReport

  const [installationReport, setInstallationReport] = useState(null);
  const handleInstallationReport = (event) => {
    const file = event.target.files[0];
    setInstallationReport(file);
  };
  const deleteInstallationFile = () => {
    setInstallationReport(null);
  };

  return auth.currentUser ? (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          // background: "red",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
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
        <Card sx={{ minWidth: 275, maxWidth: 700, width: 700 }}>
          <CardContent
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 2,
                }}
              >
                <Typography variant="h3" component="h3">
                  Add Location
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    const stepProps = { completed: undefined };
                    const labelProps = { optional: undefined };
                    if (isStepOptional(index)) {
                      labelProps.optional = (
                        <Typography variant="caption">Optional</Typography>
                      );
                    }
                    if (isStepSkipped(index)) {
                      stepProps.completed = false;
                    }
                    return (
                      <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                {activeStep !== steps.length && (
                  <React.Fragment>
                    {serialKey != "" && (
                      <AddLocationField
                        page={activeStep + 1}
                        serialKey={serialKey}
                        locationValueHandler={locationValueHandler}
                        handleInstallationReport={handleInstallationReport}
                        deleteInstallationFile={deleteInstallationFile}
                        installationReport={installationReport}
                      />
                    )}
                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                      <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Box sx={{ flex: "1 1 auto" }} />
                      {isStepOptional(activeStep) && (
                        <Button
                          color="inherit"
                          onClick={handleSkip}
                          sx={{ mr: 1 }}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        onClick={handleNext}
                        disabled={
                          activeStep == 0 && selectedLocations.location1 == ""
                            ? true
                            : activeStep == 1 &&
                              selectedLocations.location2 == ""
                            ? true
                            : activeStep == 2 &&
                              selectedLocations.location3 == ""
                            ? true
                            : activeStep == 3 && installationReport == null
                            ? true
                            : false
                        }
                      >
                        {activeStep === steps.length - 1 ? "Finish" : "Next"}
                      </Button>
                    </Box>
                  </React.Fragment>
                )}
              </Grid>
              <Grid item></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  ) : (
    <div></div>
  );
}

export default addLocation;
