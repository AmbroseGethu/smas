import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { userContext } from "./_app";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { rootDirectory } from "@/components/RootDirectory";
import { useRouter } from "next/router";
import { auth } from "@/components/Firebase";

function accessRequests() {
  const { authUser, setAuthUser } = useContext(userContext);
  const router = useRouter();
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
  const [requests, setRequests] = useState([]);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  const fetchRequests = async () => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/accessRequest`,
      {
        condition: "fetchRequests",
        userToken: authUser.token,
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
      setRequests(response.data);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Accept Access

  const acceptAccess = async (request, skey) => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/accessRequest`,
      {
        condition: "acceptAccess",
        mobile: request.Mobile,
        skey: skey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );
    if (response.data === 1) {
      fetchRequests();
      setSnackMessage("Access Approved..");
      setSnackSeverity("success");
      setSnackBar(true);
    } else if (response.data == -1) {
      setSnackMessage(response.data);
      setSnackSeverity("error");
      setSnackBar(true);
    } else if (response.data == -2) {
      setSnackMessage("User Verification Failed");
      setSnackSeverity("error");
      setSnackBar(true);
    }
  };

  // Reject Access

  const rejectAccess = async (name, skey) => {
    const response = await axios.post(
      `http://${rootDirectory}:3000/api/accessRequest`,
      {
        condition: "rejectAccess",
        name: name,
        skey: skey,
      },
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
    );

    if (response.data === 1) {
      fetchRequests();
      setSnackMessage("Access Rejected..");
      setSnackSeverity("success");
      setSnackBar(true);
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

  return (
    <Grid
      container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
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
      <Card sx={{ width: "80%", padding: 4, background: "#E5E0FF" }}>
        <Typography
          variant="h4"
          sx={{
            width: "100%",
            textAlign: "center",
            color: "black",
            marginTop: "10px",
            marginBottom: "10px",
            fontWeight: "bold",
            fontFamily: "Montserrat, sans-serif ",
          }}
        >
          {" "}
          ACCESS REQUESTS
        </Typography>
        <CardContent>
          {requests.length == 0 && (
            <div style={{ width: "100%", textAlign: "center" }}>
              No Requests Found
            </div>
          )}
          {requests.length > 0 &&
            requests.map((request) => (
              <Accordion sx={{ background: "#ECF2FF" }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography sx={{ fontSize: "18px", color: "black" }}>
                    {request.Name} is requesting access to edit
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {request.Serial_key.split(",").map((skey) => (
                    <Card
                      key={skey}
                      sx={{ marginBottom: 2, background: "#fff" }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography>
                          <b>Serial Number: </b>
                          {skey}
                        </Typography>
                        <span>
                          <Button
                            variant="contained"
                            sx={{
                              background: "green",
                              "&:hover": { background: "#228B22" },
                              marginRight: "5px",
                            }}
                            onClick={(e) => acceptAccess(request, skey)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            sx={{
                              background: "red",
                              "&:hover": { background: "#B71C1C" },
                            }}
                            onClick={(e) => rejectAccess(request.Name, skey)}
                          >
                            Reject
                          </Button>
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                  {/* <Button variant="contained">Approve</Button>
                  <Button variant="contained">Reject</Button> */}
                </AccordionDetails>
              </Accordion>
            ))}
        </CardContent>
      </Card>
    </Grid>
  );
}

export default accessRequests;
