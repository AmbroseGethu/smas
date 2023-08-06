import { auth } from "@/components/Firebase";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { userContext } from "./_app";
import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";

function profile() {
  const router = useRouter();
  const { authUser, setAuthUser } = useContext(userContext);
  const [userDetails, setUserDetails] = useState(authUser.details);
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
  useEffect(() => {
    console.log(userDetails);
  }, [userDetails]);
  return auth.currentUser ? (
    <Grid
      container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(186, 224, 248);",
      }}
    >
      <Card sx={{ width: "70%" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            component="h4"
            variant="h4"
            sx={{
              textAlign: "center",
              marginTop: 2,
              fontWeight: "bold",
              width: "100%",
              fontFamily: "Montserrat, sans-serif ",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: "42px", marginRight: "10px" }} />
            MY PROFILE
            <PersonIcon sx={{ fontSize: "42px", marginLeft: "10px " }} />
          </Typography>
          <Grid
            container
            sx={{
              marginTop: "20px",
              paddingBottom: 4,
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
                Username:{" "}
              </InputLabel>
              <TextField
                value={userDetails.Name}
                sx={{ fontSize: "16px", width: "80%" }}
              ></TextField>
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
                Mobile:{" "}
              </InputLabel>
              <TextField
                value={userDetails.Mobile}
                sx={{ fontSize: "16px", width: "80%" }}
              ></TextField>
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
                value={userDetails.Email}
                sx={{ fontSize: "16px", width: "80%" }}
              ></TextField>
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
                gap: 2,
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
                Update Password:{" "}
              </InputLabel>
              <Link href="/newPassword" as="/newPassword" passHref>
                <Button
                  variant="contained"
                  sx={{
                    background: "black",
                    "&:hover": {
                      background: "#444",
                    },
                  }}
                  onClick={(e) =>
                    window.history.pushState(
                      "newpassbyuser",
                      "",
                      "/newPassword"
                    )
                  }
                >
                  New Password
                </Button>
              </Link>
            </Grid>
            {authUser.details.Designation == "staff" && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ textAlign: "center" }}>
                  To Edit Profile, contact Administrator.
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  ) : (
    <div></div>
  );
}

export default profile;
