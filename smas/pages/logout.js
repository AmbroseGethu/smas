import { auth } from "@/components/Firebase";
import { signOut } from "@firebase/auth";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { userContext } from "./_app";
import { useRouter } from "next/router";

function logout() {
  const { setAuthUser } = useContext(userContext);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logoutHandler = () => {
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
  };
  useEffect(() => {
    setOpen(true);
    logoutHandler();
  }, []);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default logout;
