import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  InputLabel,
  Snackbar,
  TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { userContext } from "./_app";
import axios from "axios";
import { useRouter } from "next/router";
import { signOut, updatePassword, updateProfile } from "@firebase/auth";
import { auth } from "@/components/Firebase";
import { rootDirectory } from "@/components/RootDirectory";

const newPassword = () => {
  const router = useRouter();
  const [formDetails, setFormDetails] = useState({
    pass: "",
    confirmPass: "",
  });

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  // Authenticated User

  const { authUser, setAuthUser } = useContext(userContext);
  // Redirect for Non New Users:
  useEffect(() => {
    if (authUser == "guest" || authUser == "hacker") {
      router.push("/login");
    } else if (
      authUser &&
      authUser.details.NewUser == false &&
      window.history.state != "newpassbyuser"
    ) {
      router.push("/dashboard");
    } else if (!auth.currentUser) {
      router.push("/login");
    }
  }, [authUser]);

  const redirectME = () => {
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const setNewPassword = async () => {
    if (formDetails.pass.length < 8) {
      setSnackMessage("Password must contain atleast 8 letters");
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (formDetails.pass != formDetails.confirmPass) {
      setSnackMessage("Password didn't match");
      setFormDetails((details) => ({ ...details, confirmPass: "" }));
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (formDetails.pass == formDetails.confirmPass) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/user`,
        {
          formDetails: JSON.stringify(formDetails.pass),
          condition: "newUserPasswordUpdate",
          userDetails: JSON.stringify(authUser.details),
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      if (response.data == 1) {
        // alert(authUser.details.Email);
        // const newToken = await axios.post(`http://${rootDirectory}:3000/api/getJWT`, {
        //   condition: "getJWTByEmail",
        //   email: authUser.details.Email,
        //   // key: "sakthiGethu",
        // });
        // console.log("NEW TOKEN : ", newToken.data);
        // var token = newToken.data;
        // if (token == -1) {
        //   setSnackMessage("Unhandled exception while updating password");
        //   setSnackSeverity("error");
        //   setSnackBar(true);
        //   return;
        // } else {
        //   alert("called");
        //   router.push("/dashboard");
        // }
        setSnackMessage("Password Changed..");
        setSnackSeverity("success");
        setSnackBar(true);
        const tokenFromAuth = authUser.token;
        var detailsFromAuth = authUser.details;
        detailsFromAuth.NewUser = false;
        // setAuthUser({ token: tokenFromAuth, details: detailsFromAuth });
        signOut(auth)
          .then(() => {
            // Sign-out successful.
          })
          .catch((error) => {
            // An error happened.
            alert(error);
            return;
          });
        setAuthUser("guest");
        router.push("/login");

        // redirectME();
        // const newDetails = await axios.post(`http://${rootDirectory}:3000/api/user`, {
        //   email: authUser.details.Email,
        //   condition: "getUserByEmail",
        // });
        // console.log(newDetails.data);
        // const currentUser = auth.currentUser;

        // updatePassword(currentUser, formDetails.pass)
        //   .then(() => {
        //     setAuthUser({ token: token, details: newDetails.data });
        //   })
        //   .catch((error) => {
        //     setSnackMessage(error);
        //     setSnackSeverity("error");
        //     setSnackBar(true);
        //   });
      } else if (response.data == -1) {
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

  return auth.currentUser ? (
    <Grid
      container
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
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
      <Card sx={{ width: "40%" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <InputLabel>New Password:</InputLabel>
          <TextField
            type="password"
            placeholder="My New Password"
            value={formDetails.pass}
            onChange={(e) =>
              setFormDetails((details) => ({
                ...details,
                pass: e.target.value,
              }))
            }
          />
          <InputLabel>Confirm Password:</InputLabel>
          <TextField
            type="password"
            placeholder="Again the same..."
            value={formDetails.confirmPass}
            onChange={(e) =>
              setFormDetails((details) => ({
                ...details,
                confirmPass: e.target.value,
              }))
            }
          />
          <span
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button variant="contained" onClick={setNewPassword}>
              Set Password
            </Button>
          </span>
        </CardContent>
      </Card>
    </Grid>
  ) : (
    <div></div>
  );
};
export default newPassword;
