import "../styles/Global.css";
import Navbar from "../components/Navbar.js";
import MainPage from "../components/MainPage.js";
import { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/components/Firebase";
import { onAuthStateChanged } from "@firebase/auth";
import axios from "axios";
import { useRouter } from "next/router";
import { rootDirectory } from "@/components/RootDirectory";

export const userContext = createContext();

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState("guest");
  const [firebaseUser, setFirebaseUser] = useState(
    !auth.currentUser ? "guest" : auth.currentUser
  );

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      setFirebaseUser(user);
      // ...
    } else {
      setFirebaseUser("guest");
    }
  });
  useEffect(() => {
    router.push("/login");
  }, []);

  const fetchUserByEmail = async () => {
    const response = await axios.post(`http://${rootDirectory}:3000/api/user`, {
      condition: "getUserByEmail",
      email: firebaseUser.email,
    });
    const responseData = response.data;

    const tokenResponse = await axios.post(
      `http://${rootDirectory}:3000/api/getJWT`,
      {
        condition: "getJWTWithoutPassword",
        formDetails: JSON.stringify(response.data),
        // key: "sakthiGethu",
      }
    );
    setAuthUser({ token: tokenResponse.data, details: responseData });
  };
  useEffect(() => {
    if (firebaseUser && firebaseUser != "") {
      fetchUserByEmail();
    }
  }, [firebaseUser]);

  return (
    <userContext.Provider value={{ authUser, setAuthUser }}>
      <div className="MainAppContainer">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </userContext.Provider>
  );
}
