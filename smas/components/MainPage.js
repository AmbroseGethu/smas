import React from "react";
import Navbar from "./Navbar.js";
import styles from "../styles/MainPage.module.css";
function MainPage() {
  return (
    <div className={styles.MainPage__container}>
      <Navbar />
    </div>
  );
}

export default MainPage;
