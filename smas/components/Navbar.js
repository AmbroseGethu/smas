import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";
import DashboardSharpIcon from "@mui/icons-material/DashboardSharp";
import { Button, Divider, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CategorySharpIcon from "@mui/icons-material/CategorySharp";
import InventorySharpIcon from "@mui/icons-material/InventorySharp";
import AssessmentSharpIcon from "@mui/icons-material/AssessmentSharp";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ShoppingBasketRoundedIcon from "@mui/icons-material/ShoppingBasketRounded";
import Link from "next/link";
import { useRouter } from "next/router";
import { userContext } from "@/pages/_app";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import FlakyIcon from "@mui/icons-material/Flaky";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

function navbar({ children }) {
  const { authUser, setAuthUser } = useContext(userContext);
  // Check for user
  useEffect(() => {
    if (authUser != "guest" && authUser != "hacker") {
      router.push("/dashboard");
    }
  }, []);
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(true);
  const [visibility, setVisibility] = useState("visible");
  const toggle = () => {
    setNavOpen(!navOpen);
  };
  const navDisplayOff = () => {
    // alert("called");
    setNavOpen(false);
  };

  useEffect(() => {
    if (navOpen) {
      setTimeout(() => {
        setVisibility("visible");
      }, 200);
    } else {
      setVisibility("hidden");
    }
  }, [navOpen]);

  const initialItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <DashboardSharpIcon sx={{ fontSize: "22px" }} />,
      active: true,
    },
    {
      path: "/items",
      name: "Items",
      icon: <InventorySharpIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },
    {
      path: "/purchase",
      name: "Purchase",
      icon: <CategorySharpIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },
    {
      path: "/report",
      name: "Report",
      icon: <AssessmentSharpIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },
    {
      path: "/order",
      name: "Order",
      icon: <ShoppingBasketRoundedIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },

    {
      path: "/profile",
      name: "Profile",
      icon: <AccountBoxIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },
  ];

  const loginItem = [
    {
      path: "/login",
      name: "Login",
      icon: <AccountCircleRoundedIcon sx={{ fontSize: "22px" }} />,
      active: false,
    },
  ];

  const [menuItems, setMenuItems] = useState(loginItem);

  useEffect(() => {
    if (authUser == "guest") {
      const item = {
        path: "/login",
        name: "Login",
        icon: <AccountCircleRoundedIcon sx={{ fontSize: "22px" }} />,
        active: false,
      };

      setMenuItems((items) => [item]);
    } else if (
      authUser.details.Designation == "Administrator" ||
      authUser.details.Designation == "HoD"
    ) {
      const item = [
        {
          path: "/accessRequests",
          name: "Requests",
          icon: <AccessibilityNewIcon sx={{ fontSize: "22px" }} />,
          active: false,
        },
        {
          path: "/users",
          name: "Users",
          icon: <GroupIcon sx={{ fontSize: "22px" }} />,
          active: false,
        },
        {
          path: "/logout",
          name: "Logout",
          icon: <LogoutIcon sx={{ fontSize: "22px" }} />,
          active: false,
        },
      ];
      setMenuItems(initialItems);
      setMenuItems((items) => [...items, item[0], item[1], item[2]]);
      router.push("/dashboard");
    } else if (
      authUser != "guest" &&
      authUser != "hacker" &&
      authUser.details.Designation == "Staff"
    ) {
      const item = {
        path: "/logout",
        name: "Logout",
        icon: <AccountCircleRoundedIcon sx={{ fontSize: "22px" }} />,
        active: false,
      };
      setMenuItems(initialItems);
      setMenuItems((items) => [...items, item]);
      router.push("/dashboard");
    }
  }, [authUser]);

  useEffect(() => {
    console.log(menuItems);
  }, [menuItems]);

  const LinkClassNames = (item) => {
    const classNames = [styles.nav__link];
    if (router.pathname.includes(item.name.toLowerCase())) {
      classNames.push(styles.nav__linkActive);
    }
    return classNames.join(" ");
  };

  return (
    <div className={styles.nav__container} onClick={toggle}>
      <div
        style={{ width: navOpen ? "222px" : "65px" }}
        className={styles.nav__sidebar}
        // onBlur={navDisplayOff}
      >
        <div className={styles.nav__topSection}>
          <h1 style={{ visibility }} className={styles.nav__logo}>
            SMAS
          </h1>
          <div
            style={{
              marginLeft: navOpen ? "80px" : "-74px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className={styles.nav__bars}
          >
            <MenuIcon onClick={toggle} sx={{ fontSize: "30px" }} />
          </div>
        </div>
        {Array.isArray(menuItems) &&
          menuItems.map((item, index) => (
            <Link
              href={item.path}
              key={index}
              className={LinkClassNames(item)}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                // borderBottom: "1px solid rgba(254, 252, 255, 0.2)",
                width: "100%",
                padding: "15px 0px 15px 22px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                className={styles.nav__linkIcon}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.icon}
              </div>
              <div
                className={styles.nav__linkText}
                style={{
                  marginLeft: "5px",
                  fontSize: "17px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "-1px",
                }}
              >
                {item.name}
              </div>
            </Link>
          ))}
      </div>
      <main>{children}</main>
    </div>
  );
}

export default navbar;
