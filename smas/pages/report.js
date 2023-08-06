import { auth } from "@/components/Firebase";
import ReportPage1 from "@/components/ReportPage1";
import ReportPage2 from "@/components/ReportPage2";
import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import { userContext } from "./_app";

function report() {
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
  return auth.currentUser ? <ReportPage2 /> : <div></div>;
}

export default report;
