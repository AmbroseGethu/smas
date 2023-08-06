import { ValidateEmail } from "@/components/ValidateEmail";
import { validateMobile } from "@/components/ValidateMobile";
import {
  Card,
  CardContent,
  Grid,
  InputLabel,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { auth, db } from "@/components/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { toTitleCase } from "@/components/TitleCase";
import { userContext } from "./_app";
import { rootDirectory } from "@/components/RootDirectory";

function addUser() {
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
  const [formDetails, setFormDetails] = useState({
    name: "",
    password: "rootroot",
    mobile: "",
    email: "",
    designation: "",
  });

  // SnackBar

  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");
  const [snackMessage, setSnackMessage] = useState("");
  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
  };

  const addUser = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/user`,
      {
        condition: "addUser",
        formDetails: JSON.stringify(formDetails),
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );

    if (response.data == -1) {
      setSnackMessage("Mobile No. or Email Already exists");
      setSnackSeverity("error");
      setSnackBar(true);
      return -1;
    } else if (response.data == 1) {
      setTimeout(() => {
        setFormDetails({
          name: "",
          password: "rootroot",
          mobile: "",
          email: "",
          designation: "",
        });
      }, 1000);
      return 1;
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == 404) {
      setSnackMessage("Error in API");
      setSnackSeverity("error");
      setSnackBar(true);
    }
  };

  const submitUser = async () => {
    if (
      formDetails.name == "" ||
      formDetails.mobile == "" ||
      formDetails.email == "" ||
      formDetails.designation == ""
    ) {
      setSnackMessage("Enter all the fields");
      setSnackSeverity("error");
      setSnackBar(true);
      return;
    } else if (!validateMobile(formDetails.mobile)) {
      setSnackMessage("Invalid Mobile No.");
      setSnackSeverity("error");
      setSnackBar(true);
      return;
    } else if (!ValidateEmail(formDetails.email)) {
      setSnackMessage("Invalid Email ID");
      setSnackSeverity("error");
      setSnackBar(true);
      return;
    } else {
      const checkForDuplicate = await axios.post(
        `http://${rootDirectory}:3000/api/user`,
        {
          condition: "checkForUserData",
          formDetails: JSON.stringify(formDetails),
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      const dupResponse = checkForDuplicate.data;
      if (dupResponse == -1) {
        setSnackMessage("Error in API");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (dupResponse == -2) {
        setSnackMessage("User Verification Failed");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (dupResponse == "Mobile") {
        setSnackMessage("Mobile no. Already Exists.");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (dupResponse == "Email") {
        setSnackMessage("Email ID Already Exists.");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (dupResponse == "Name") {
        setSnackMessage("Username Already Exists.");
        setSnackSeverity("error");

        setSnackBar(true);
      } else if (dupResponse == "Error") {
        setSnackMessage("Error in checking for duplicate data");
        setSnackSeverity("error");
        setSnackBar(true);
      } else if (dupResponse == "None") {
        try {
          const addResponse = await axios.post(
            `http://${rootDirectory}:3000/api/user`,
            {
              formDetails: JSON.stringify(formDetails),
              condition: "addUser",
            },
            {
              headers: {
                Authorization: `Bearer ${authUser.token}`,
              },
            }
          );
          if (addResponse.data == -1) {
            setSnackMessage("Error in API");
            setSnackSeverity("error");
            setSnackBar(true);
          } else if (addResponse.data == -2) {
            setSnackMessage("User Verification Failed");
            setSnackSeverity("error");
            setSnackBar(true);
          } else if (addResponse.data == 1) {
            setSnackMessage("User Added!");
            setSnackSeverity("success");
            setSnackBar(true);
            router.push("/users");
          } else {
            setSnackMessage("Error in adding User");
            setSnackSeverity("error");
            setSnackBar(true);
          }
        } catch (err) {
          console.log(err);
          setSnackMessage(err);
          setSnackSeverity("error");
          setSnackBar(true);
          return;
        }
      }
    }
  };

  return auth.currentUser ? (
    <Grid
      container
      sx={{
        display: "flex",
        justifyContent: "center",
        padding: "50px",
        background: "#f2b6ba",
        height: "100vh",
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
      <Card
        sx={{
          width: "80%",
          height: "fit-content",
        }}
      >
        <CardContent
          sx={{
            maxHeight: "90vh",
            overflowY: "scroll",
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Typography
            component="h3"
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: "400",
              fontSize: "45px",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              paddingRight: "0px",
            }}
          >
            Add User
          </Typography>
          <Grid
            container
            sx={{
              marginTop: "2vw",
            }}
            spacing={4}
          >
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "18px",
                  paddingLeft: 1,
                  marginBottom: 1.5,
                  width: "80%",
                }}
              >
                Enter Name:{" "}
              </InputLabel>
              <TextField
                placeholder="S. John Doe"
                sx={{ fontSize: "16px", width: "80%" }}
                value={formDetails.name}
                onChange={(e) =>
                  setFormDetails((details) => ({
                    ...details,
                    name: toTitleCase(e.target.value),
                  }))
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "18px",
                  paddingLeft: 1,
                  marginBottom: 1.5,
                  width: "80%",
                }}
              >
                Mobile No:{" "}
              </InputLabel>
              <TextField
                placeholder="987654321"
                sx={{ fontSize: "16px", width: "80%" }}
                value={formDetails.mobile}
                onChange={(e) =>
                  setFormDetails((details) => ({
                    ...details,
                    mobile: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "18px",
                  paddingLeft: 1,
                  marginBottom: 1.5,
                  width: "80%",
                }}
              >
                Email ID:{" "}
              </InputLabel>
              <TextField
                placeholder="elon@musk.com"
                type="email"
                sx={{ fontSize: "16px", width: "80%" }}
                value={formDetails.email}
                onChange={(e) =>
                  setFormDetails((details) => ({
                    ...details,
                    email: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "18px",
                  paddingLeft: 1,
                  marginBottom: 1.8,
                  width: "80%",
                }}
              >
                Enter Designation:{" "}
              </InputLabel>
              <FormControl sx={{ width: "80%" }}>
                <InputLabel id="demo-simple-select-label">
                  Designation
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  // value={age}
                  label="Designation"
                  // onChange={handleChange}
                  value={formDetails.designation}
                  onChange={(e) =>
                    setFormDetails((details) => ({
                      ...details,
                      designation: e.target.value,
                    }))
                  }
                  required={true}
                >
                  <MenuItem value={"HoD"}>HoD</MenuItem>
                  <MenuItem value={"Administrator"}>Administrator</MenuItem>
                  <MenuItem value={"Staff"}>Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                paddingRight: 8,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  background: "hotpink",
                  "&:hover": { background: "#ff8fb4" },
                }}
                onClick={submitUser}
              >
                Add User
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  ) : (
    <div></div>
  );
}

export default addUser;
