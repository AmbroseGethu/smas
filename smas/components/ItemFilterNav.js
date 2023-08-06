import React, { useEffect, useState } from "react";
import styled from "styled-components";
import styles from "../styles/Item.module.css";

function ItemFilterNav({ navHandler }) {
  const [activeNav, setactiveNav] = useState("used");
  useEffect(() => {
    navHandler(activeNav);
  }, [activeNav]);
  return (
    <div className={styles.itemNav}>
      <ul className={styles.itemNavUl}>
        <li
          className={`${styles.itemNavLi} ${
            activeNav == "used" ? styles.itemNavActive : styles.itemNavNotActive
          }`}
          onClick={(e) => setactiveNav("used")}
        >
          Used
        </li>
        <li
          className={`${styles.itemNavLi} ${
            activeNav == "new" ? styles.itemNavActive : styles.itemNavNotActive
          }`}
          onClick={(e) => setactiveNav("new")}
        >
          New
        </li>
      </ul>{" "}
    </div>
  );
}

export default ItemFilterNav;

const ItemNav = styled("div")`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  background-color: "red";
`;

// const ItemNavUl = styled("ul")`
//   list-style: none;
//   display: flex;
//   flex-direction: row;
//   justify-content: space-around;
//   /* background-color: red; */
//   width: 100%;
//   font-size: 24px;
//   padding: 0;
// `;

// const ItemNavLi = styled("li")`
//   padding: 10px 80px;
//   border-radius: 5px;
//   cursor: pointer;
//   border: 2px solid #03a9f4;
// `;
