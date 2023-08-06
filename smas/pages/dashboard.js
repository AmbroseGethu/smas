import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { userContext } from "./_app";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/components/Firebase";
import {
  Alert,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
  styled,
  tooltipClasses,
  Tooltip as MuiToolTip,
} from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";
import ExtensionOffIcon from "@mui/icons-material/ExtensionOff";
import HandymanIcon from "@mui/icons-material/Handyman";
import HelpIcon from "@mui/icons-material/Help";
import axios from "axios";
import {
  Area,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  Scatter,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { rootDirectory } from "@/components/RootDirectory";
function dashboard() {
  const router = useRouter();
  const { authUser, setAuthUser } = useContext(userContext);
  useEffect(() => {
    console.log("AuthUser from Dashboard  : ", authUser);

    if (authUser != "guest" && authUser.details.NewUser == true) {
      router.push("/newPassword");
    } else if (!auth.currentUser) {
      router.push("/login");
    }
  }, [authUser]);

  // For the SnackBar
  const [snackMessage, setSnackMessage] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("error");

  const handleClose = (event, reason) => {
    setSnackBar(false);
    setSnackMessage("");
    // setSnackError("");
  };

  // -----------------------For the selection of ACADEMIC YEAR------------------

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );

  const getNextAcademicYearArray = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear;
    const academicYears = [];
    for (let i = 2000; i <= nextYear; i++) {
      const academicYear = `${i}-${i + 1}`;
      academicYears.push(academicYear);
    }
    setAcademicYears(academicYears);
  };

  useEffect(() => {
    getNextAcademicYearArray();
  }, []);

  useEffect(() => {
    if (academicYears.length > 0) {
      setSelectedAcademicYear(academicYears[academicYears.length - 1]);
    }
  }, [academicYears]);

  // ------------------The count functions----------------------//

  const [usedCount, setUsedCount] = useState({
    start: 0,
    end: 0,
  });
  const [unUsedCount, setUnUsedCount] = useState({
    start: 0,
    end: 0,
  });
  const [notWorkingCount, setNotWorkingCount] = useState({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (usedCount.start != usedCount.end) {
        setUsedCount((count) => ({ ...count, start: count.start + 1 }));
      }
    }, 1);

    return () => clearInterval(timer);
  }, [usedCount]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (unUsedCount.start != unUsedCount.end) {
        setUnUsedCount((count) => ({ ...count, start: count.start + 1 }));
      }
    }, 1);

    return () => clearInterval(timer);
  }, [unUsedCount]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (notWorkingCount.start != notWorkingCount.end) {
        setNotWorkingCount((count) => ({ ...count, start: count.start + 1 }));
      }
    }, 1);

    return () => clearInterval(timer);
  }, [notWorkingCount]);

  const fetchUsedItemsCount = async () => {
    if (authUser.token && authUser.token != 0) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          condition: "fetchUsedCount",
          // userToken: authUser.token,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("RESPONSE FROM JWT: ", response.data);
      if (response.data == "no user") {
        setSnackMessage("Error Checking User");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");

        return;
      } else {
        setUsedCount((count) => ({ ...count, end: parseInt(response.data) }));
      }
    }
  };
  const fetchUnUsedItemsCount = async () => {
    if (authUser.token && authUser.token != 0) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          condition: "fetchUnUsedCount",
          // userToken: authUser.token,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log(response.data);
      if (response.data == "no user") {
        setSnackMessage("Error Checking User");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");
        return;
      } else {
        console.log("UnUsed Count: ", response.data);
        setUnUsedCount((count) => ({ ...count, end: parseInt(response.data) }));
      }
    }
  };

  const fetchNotWorkingCount = async () => {
    if (authUser.token && authUser.token != 0) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          condition: "fetchNotWorkingCount",
          // userToken: authUser.token,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log(response.data);
      if (response.data == "no user") {
        setSnackMessage("Error Checking User");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == -1) {
        setSnackMessage("Error in API");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");
        return;
      } else {
        setNotWorkingCount((count) => ({
          ...count,
          end: parseInt(response.data),
        }));
      }
    }
  };

  useEffect(() => {
    fetchUsedItemsCount();
    fetchUnUsedItemsCount();
    fetchNotWorkingCount();
  }, [selectedAcademicYear]);

  // -----------------Chart JS-------------------

  // custom tooltip

  const CustomTooltip = ({ active, payload, label, labelName, valueName }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            border: "2px solid #8884D8",
            background: "white",
            padding: "10px",
          }}
        >
          <p className="label">
            <span
              style={{ color: "#8884D8", fontWeight: "bold", fontSize: "16px" }}
            >{`${labelName}: `}</span>
            {`${label}`}
          </p>
          <p className="label">
            <span
              style={{ color: "#8884D8", fontWeight: "bold", fontSize: "16px" }}
            >
              {`${valueName}: `}
            </span>
            {`${payload[0].value}`}
          </p>
          {/* <p className="intro">{getIntroOfPage(label)}</p> */}
          {/* <p className="desc">Anything you want can be displayed here.</p> */}
        </div>
      );
    }

    return null;
  };

  const CustomTooltipForExpense = ({
    active,
    payload,
    label,
    labelName,
    valueName,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            border: "2px solid hotpink",
            background: "white",
            padding: "10px",
          }}
        >
          <p className="label" style={{ fontSize: "16px" }}>
            <span
              style={{ color: "hotpink", fontWeight: "bold", fontSize: "16px" }}
            >
              {`${labelName}: `}
            </span>
            {`${label}`}
          </p>
          <p className="label" style={{ fontSize: "16px" }}>
            <span
              style={{ color: "hotpink", fontWeight: "bold", fontSize: "16px" }}
            >
              {`${valueName}: `}
            </span>
            {`Rs. ${payload[0].value}`}
          </p>
          {/* <p className="intro">{getIntroOfPage(label)}</p> */}
          {/* <p className="desc">Anything you want can be displayed here.</p> */}
        </div>
      );
    }

    return null;
  };
  const CustomTooltipForPie = ({
    active,
    payload,
    label,
    labelName,
    valueName,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            border: "2px solid hotpink",
            background: "white",
            padding: "10px",
          }}
        >
          <p className="label" style={{ fontSize: "16px" }}>
            <span
              style={{ color: "hotpink", fontWeight: "bold", fontSize: "16px" }}
            >
              {`${labelName}: `}
            </span>
            {`${payload[0].payload.Item_name}`}
          </p>
          <p className="label" style={{ fontSize: "16px" }}>
            <span
              style={{ color: "hotpink", fontWeight: "bold", fontSize: "16px" }}
            >
              {`${valueName}: `}
            </span>
            {`${payload[0].value}`}
          </p>
          {/* <p className="intro">{getIntroOfPage(label)}</p> */}
          {/* <p className="desc">Anything you want can be displayed here.</p> */}
        </div>
      );
    }

    return null;
  };

  // BarChart

  const [barData, setBarData] = useState([]);

  const fetchItemsCount = async () => {
    if (authUser.token && authUser.token != 0) {
      const dateArray = selectedAcademicYear.split("-").map(Number);
      const yearArray = [];
      for (var i = 5; i > 0; i--) {
        yearArray.push(dateArray[1] - i);
      }
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          // userToken: authUser.token,
          condition: "fetchItemsCountOnDate",
          dateRange: selectedAcademicYear,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      console.log("RESPONSE: ", response.data);
      const res = response.data;
      if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");
        return;
      }
      const resultArray = yearArray.map((year) => {
        const responseItem = Array.isArray(res)
          ? res.find((item) => item.year === year.toString())
          : null;
        if (responseItem) {
          return responseItem;
        } else {
          return { year: year.toString(), count: "0" };
        }
      });
      const updatedData = resultArray.map((item) => {
        const updatedItem = {
          year: item.year,
          "New Items": item.count,
        };
        return updatedItem;
      });
      setBarData(updatedData);
    }
  };

  // PieChart

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [pieData, setPieData] = useState([]);
  const fetchItemsWithCount = async () => {
    if (authUser.token && authUser.token != 0) {
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          condition: "fetchItemsWithCount",
          // userToken: authUser.token,
          dateRange: selectedAcademicYear,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      const res = response.data;
      if (res == -2) {
        setSnackMessage("User Verification Failed");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (res == -1) {
        setSnackMessage("Error in API");
        setSnackBar(true);
        setSnackSeverity("error");
      } else if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");
        return;
      } else {
        console.log("PIE DATA: ", res);
        const updatedData =
          res != -1
            ? res.map((item) => {
                const updatedItem = {
                  Item_name: item.Item_name,
                  Count: parseInt(item.count),
                };
                return updatedItem;
              })
            : [];
        console.log("UPdated Data: ", updatedData);
        setPieData(updatedData);
        // pieData.push(updatedData);
      }
    }
  };

  const [expenseBarData, setExpenseBarData] = useState([]);

  const fetchExpenseBarData = async () => {
    if (authUser.token && authUser.token != 0) {
      const dateArray = selectedAcademicYear.split("-").map(Number);
      const yearArray = [];
      for (var i = 5; i > 0; i--) {
        yearArray.push(dateArray[1] - i);
      }
      const response = await axios.post(
        `http://${rootDirectory}:3000/api/dashboardAPI`,
        {
          condition: "fetchExpenses",
          // userToken: authUser.token,
          dateRange: selectedAcademicYear,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      const res = response.data;
      console.log("Expense RESPONSE: ", res);
      if (response.data == "jwtverificationerror") {
        setSnackMessage("Error while verifying user");
        setSnackBar(true);
        setSnackSeverity("error");
        return;
      }
      const resultArray = yearArray.map((year) => {
        const responseItem = Array.isArray(res)
          ? res.find((item) => item.year === year.toString())
          : null;
        if (responseItem) {
          return responseItem;
        } else {
          return { year: year.toString(), sum: "0" };
        }
      });

      const updatedData =
        res != -1
          ? resultArray.map((item) => {
              const updatedItem = {
                Year: item.year,
                Spent: parseInt(item.sum),
              };
              return updatedItem;
            })
          : [];
      console.log("Expense Data: ", updatedData);
      setExpenseBarData(updatedData);
      // pieData.push(updatedData);
    }
  };

  useEffect(() => {
    fetchItemsCount();
    fetchItemsWithCount();
    fetchExpenseBarData();
  }, [selectedAcademicYear]);

  useEffect(() => {
    console.log("ExpenseBarData: ", expenseBarData);
  }, [expenseBarData]);

  // ---------Tooltip

  const BootstrapTooltip = styled(({ className, ...props }) => (
    <MuiToolTip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: "hotpink",
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "white",
      border: "2px solid hotpink",
      color: "black",
      fontSize: "14px",
    },
  })); // ----------------------------------------------

  return auth.currentUser ? (
    <Grid
      container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100vh",
        overflowY: "scroll",
        background: "#E8A0BF",
        paddingTop: "40px",
        paddingBottom: "20px",
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
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "90%", background: "#fff  " }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                width: "100%",
                textAlign: "center",
                fontWeight: "500",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              My Dashboard
            </Typography>
            <Grid container>
              <Grid
                item
                xs={12}
                sx={{ marginBottom: 5, margin: "10px 50px 30px 50px" }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: 2,
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Select Academic Year:{" "}
                  <BootstrapTooltip
                    placement="right"
                    title="Academic years represents the month of April to March"
                  >
                    {/* <IconButton> */}
                    <HelpIcon
                      sx={{
                        marginLeft: "5px",
                        marginTop: "2px",
                        fontSize: "22px",
                        color: "hotpink",
                      }}
                    />
                    {/* </IconButton> */}
                  </BootstrapTooltip>
                </Typography>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  >
                    {academicYears.length > 0 ? (
                      academicYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem>No Year Fetched..</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="p"
                  sx={{ textAlign: "left", fontWeight: "bold" }}
                >
                  Items In Stock:{" "}
                </Typography>

                <PieChart width={300} height={250}>
                  <Pie
                    data={pieData}
                    dataKey="Count"
                    nameKey="Item_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    fill="hotpink"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltipForPie
                        labelName={"Item"}
                        valueName={"Count"}
                      />
                    }
                  />
                </PieChart>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography variant="p" sx={{ fontWeight: "bold" }}>
                  New Purchases:
                </Typography>
                {/* <BarChartNewOld dateRange={selectedAcademicYear} /> */}
                <BarChart width={400} height={250} data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, "dataMax"]} />
                  <Tooltip
                    content={
                      <CustomTooltip labelName={"Year"} valueName={"Items"} />
                    }
                  />
                  <Legend />
                  <Bar dataKey="New Items" fill="#8884d8" />
                  {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                </BarChart>
              </Grid>
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography variant="p" sx={{ fontWeight: "bold" }}>
                  Expense Data:
                </Typography>
                {/* <BarChartNewOld dateRange={selectedAcademicYear} /> */}
                <BarChart width={800} height={250} data={expenseBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Year" />
                  <YAxis domain={[0, "dataMax"]} style={{ fontSize: "12px" }} />
                  <Tooltip
                    content={
                      <CustomTooltipForExpense
                        labelName={"Year"}
                        valueName={"Spent"}
                      />
                    }
                  />
                  <Legend />
                  <Brush dataKey="Year" height={30} stroke="#8884d8" />

                  <Bar dataKey="Spent" fill="hotpink" />
                  {/* <Bar dataKey="Spent" fill="#82ca9d" /> */}
                </BarChart>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Card sx={{ width: "90%" }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "10px 10px",
            }}
          >
            <div className="countContainer" style={{}}>
              <Grid container spacing={5}>
                <Grid
                  item
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  xs={12}
                  md={4}
                >
                  <ExtensionIcon sx={{ fontSize: 40, color: "green" }} />{" "}
                  <ul
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      listStyle: "none",
                    }}
                  >
                    <li>Items&nbsp;Working</li>
                    <li>{usedCount.start}</li>
                  </ul>
                </Grid>
                <Grid
                  item
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  xs={12}
                  md={4}
                >
                  <ExtensionOffIcon sx={{ fontSize: 40, color: "red" }} />{" "}
                  <ul
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      listStyle: "none",
                    }}
                  >
                    <li>UnUsed&nbsp;Items</li>
                    <li>{unUsedCount.start}</li>
                  </ul>
                </Grid>
                <Grid
                  item
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  xs={12}
                  md={4}
                >
                  <HandymanIcon sx={{ fontSize: 40, color: "hotpink" }} />{" "}
                  <ul
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      listStyle: "none",
                    }}
                  >
                    <li>Defected</li>
                    <li>{notWorkingCount.start}</li>
                  </ul>
                </Grid>
              </Grid>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ) : (
    <div></div>
  );
}

export default dashboard;
