import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputLabel,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ItemFilterForm from "../components/ItemFilterForm.js";
import ItemFilterNav from "../components/ItemFilterNav";
import { auth } from "@/components/Firebase.js";
import { useRouter } from "next/router.js";
import { rootDirectory } from "@/components/RootDirectory.js";
import { userContext } from "./_app.js";

function items({ usedKeys, newKeys }) {
  const router = useRouter();
  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, []);
  const [serialKeys, setSerialKeys] = useState([]);
  const [itemNavActive, setItemNavActive] = useState("used");

  const navHandler = (e) => {
    console.log("called navhandler: ", e);
    setItemNavActive(e);
  };
  const { authUser } = useContext(userContext);
  useEffect(() => {
    console.log("AuthUser from Dashboard  : ", authUser);

    if (authUser != "guest" && authUser.details.NewUser == true) {
      router.push("/newPassword");
    } else if (!auth.currentUser) {
      router.push("/login");
    }
  }, [authUser]);
  useEffect(() => {
    console.log(serialKeys);
  }, [serialKeys]);
  return auth.currentUser ? (
    <Grid
      container
      sx={{
        background: "#394867",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            minWidth: 275,
            maxWidth: "100%",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "scroll",
            "::-webkit-scrollbar": {
              display: "none",
            },
            background: "#F1F6F9",
          }}
        >
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
            <ItemFilterNav navHandler={navHandler} />
            {/* <ItemFilterNav /> */}
            <ItemFilterForm
              usedKeys={usedKeys}
              newKeys={newKeys}
              itemNavActive={itemNavActive}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ) : (
    <div></div>
  );
}

export default items;

export async function getStaticProps({ Context }) {
  const response = await axios.post(
    `http://${rootDirectory}:3000/api/fetchSerialKeys`,
    {
      condition: "used",
    }
  );
  const res = response.data;
  const listOfUsedKeys = res.map((singleResult) => singleResult.Serial_key);
  const response2 = await axios.post(
    `http://${rootDirectory}:3000/api/fetchSerialKeys`,
    {
      condition: "new",
    }
  );
  const res2 = response2.data;
  const listOfNewKeys = res2.map((singleResult) => singleResult.Serial_key);

  return {
    props: {
      usedKeys: listOfUsedKeys,
      newKeys: listOfNewKeys,
    },
  };
}
