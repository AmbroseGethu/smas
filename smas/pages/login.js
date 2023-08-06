import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  InputLabel,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/Login.module.css";
import jwt from "jsonwebtoken";

import {
  createUserWithEmailAndPassword,
  getAuth,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth, db } from "@/components/Firebase";
import { validateMobile } from "@/components/ValidateMobile";
import { doc, getDoc } from "firebase/firestore";
import SendOtp from "@/components/SendOtp";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";
import { userContext } from "./_app";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { rootDirectory } from "@/components/RootDirectory";

function login() {
  const router = useRouter();
  // For Spinner
  const [backdrop, setBackdrop] = useState(false);
  const [loading, setLoading] = useState(false);
  // Next Auth

  // For media queries
  const isXSScreen = useMediaQuery(`(max-width: 600px)`);
  const isMediumScreen = useMediaQuery(
    `(min-width: 600px) and (max-width: 1200px)`
  );
  const isLargeScreen = useMediaQuery(`(min-width: 1200px)`);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  //  ---------------------------------------------------
  // const [otpSeverity, setOtpSeverity] = useState("error");

  // const [otpSent, setOtpSent] = useState(false);

  // const [mobile, setMobile] = useState(null);
  // const [otp, setOtp] = useState(null);
  // const [otpMobile, setOtpMobile] = useState("");

  const [formDetails, setFormDetails] = useState({
    mobile: "",
    password: "",
  });

  // -------------NEW AUTHENTICATION--------------

  const { authUser, setAuthUser } = useContext(userContext);

  const [formToken, setFormToken] = useState("");
  const signIn = async () => {
    setLoading(true);
    if (formDetails.mobile.length == 0) {
      setSnackMessage("Enter Mobile no.");
      setSnackSeverity("error");
      setSnackBar(true);
      setLoading(false);
    } else if (!validateMobile(formDetails.mobile)) {
      setSnackMessage("Invalid Mobile No.");
      setSnackSeverity("error");
      setSnackBar(true);
      setLoading(false);
    } else if (formDetails.password == "") {
      setSnackMessage("Enter Password");
      setSnackSeverity("error");
      setSnackBar(true);
      setLoading(false);
    } else {
      const tokenResponse = await axios.post(
        `http://${rootDirectory}:3000/api/getJWT`,
        {
          condition: "getJWT",
          formDetails: JSON.stringify(formDetails),
          // key: "sakthiGethu",
        }
      );
      if (tokenResponse.data == 0) {
        setSnackMessage("Invalid Credentials");
        setSnackSeverity("error");
        setSnackBar(true);
        setLoading(false);
        return;
      } else if (tokenResponse.data == -1) {
        setSnackMessage("Error while signing in..");
        setSnackSeverity("error");
        setSnackBar(true);
        setLoading(false);
        return;
      }
      setFormToken(tokenResponse.data);
      const responseToken = tokenResponse.data;
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/user`,
        {
          condition: "login",
          // formDetails: responseToken,
        },
        {
          headers: {
            Authorization: `Bearer ${responseToken}`,
          },
        }
      );
      if (response.data == "Hacker Ahead..") {
        setSnackBar(true);
        setSnackMessage(response.data);
        setSnackSeverity("error");
        return;
      }
      const user = response.data.token
        ? response.data
        : response.data == 0
        ? "guest"
        : "hacker";
      if (user == "guest" || user == "hacker") {
        setLoading(false);
        setSnackBar(true);
        setSnackMessage("Invalid Credentials");
        setSnackSeverity("error");
        return;
      }
      // setBackdrop(true);
      const responseMail = await axios.post(
        `http://${rootDirectory}:3000/api/user`,
        {
          condition: "getMail",
          formDetails: JSON.stringify(formDetails),
        },
        {
          headers: {
            Authorization: `Bearer ${responseToken}`,
          },
        }
      );
      const userMail = responseMail.data.Email;
      createUserWithEmailAndPassword(auth, userMail, "sakthiGethu")
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
            signInWithEmailAndPassword(auth, userMail, "sakthiGethu")
              .then((userCredential) => {
                setAuthUser(user);
                setLoading(false);

                // setBackdrop(false);
                router.push("/dashboard");
              })
              .catch((err) => {
                console.log(err);
                setSnackMessage(err);
                setSnackSeverity("error");
                setSnackBar(true);
                setLoading(false);

                // setBackdrop(false);
                return;
              });
          }
          // console.log(errorMessage);
          // setSnackMessage(errorMessage);
          // setSnackSeverity("error");
          // setSnackBar(true);
          // return;
          // ..
        });
      // signInWithEmailAndPassword(auth, userMail, "sakthiGethu")
      //   .then((userCredential) => {
      //     // Signed in
      //     const userFirebase = userCredential.user;
      //     alert("Firebase called  ");
      //     setAuthUser(user);
      //     // router.push("/dashboard");
      //     // ...
      //   })
      //   .catch((error) => {
      //     const errorCode = error.code;

      //     const errorMessage = error.message;
      //     setAuthUser("guest");
      //     setBackdrop(false);
      //     setSnackBar(true);
      //     setSnackMessage(errorMessage);
      //     setSnackSeverity("error");
      //     return;
      //   });
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f2b6ba",
        // background: "slategrey",
      }}
    >
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdrop}
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
      {/* <Grid
        container
        sx={{ width: "500px", height: "80%", position: "absolute" }}
      >
        <Grid item xs={4} sx={{ background: "transparent" }}></Grid>
        <Grid item xs={8} sx={{ background: "black", borderRadius: 5 }}></Grid>
      </Grid> */}
      <Card
        sx={{
          zIndex: 2,
          width: isXSScreen ? "90%" : isMediumScreen ? "65%" : "45%",
          borderRadius: 5,
          boxShadow: "none",
          background: "white",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 6,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              marginBottom: 4,
              fontWeight: "bold",
              fontSize: 32,
              display: "flex",
              justifyContent: "center ",
            }}
            className={styles.label}
          >
            {" "}
            Sign in
          </Typography>
          <InputLabel
            htmlFor=""
            sx={{
              fontSize: 14,
              color: "black",
              fontWeight: "bold",
              marginBottom: 1,
            }}
            className={styles.label}
          >
            Mobile Number
          </InputLabel>
          <TextField
            type="tel"
            sx={{
              marginBottom: 4,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#f2b6ba",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f2b6ba",
                },
              },
            }}
            value={formDetails.mobile}
            onChange={(e) =>
              setFormDetails((details) => ({
                ...details,
                mobile: e.target.value,
              }))
            }
          />
          {/* <span
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            <Button
              variant="contained"
              sx={{
                background: "black",
                width: "30%",
                borderRadius: "10px",
                "&:hover": {
                  background: "#333",
                },
              }}
              id="otpSendButton"
              onClick={(e) => {
                sendOTP();
              }}
            >
              Send OTP
            </Button>
          </span> */}
          <InputLabel
            htmlFor=""
            sx={{
              fontSize: 14,
              color: "black",
              fontWeight: "bold",
              marginBottom: 1,
            }}
            className={styles.label}
          >
            Password
          </InputLabel>
          <TextField
            type="password"
            sx={{
              marginBottom: 4,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#f2b6ba",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f2b6ba",
                },
              },
            }}
            value={formDetails.password}
            onChange={(e) =>
              setFormDetails((details) => ({
                ...details,
                password: e.target.value,
              }))
            }
          />
          <span
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            <Button
              variant="contained"
              sx={{
                background: "black",
                width: "30%",
                borderRadius: "10px",
                "&:hover": {
                  background: "#333",
                },
              }}
              // onClick={confirmOTP}
              onClick={signIn}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export default login;
