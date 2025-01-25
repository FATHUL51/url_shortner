import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import logo from "../assets/Cuvette MERN Final Evaluation Jan 25.svg";
import "./Home.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Greet from "../components/Greet";
import SearchComponent from "../components/Search";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [name, setName] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [deviceGraphData, setDeviceGraphData] = useState([]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const getSidebarItemClass = (path) => {
    return location.pathname === path ? "sidebar-item active" : "sidebar-item";
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      Toastify({ text: "Logged out successfully" }).showToast();
      navigate("/login");
    }
    console.log("Logout clicked");
  };

  const fetchUserName = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setName(response.data.data.username);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGraphData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        const rawData = response.data.data;

        // Date-wise aggregation
        const aggregatedData = rawData.map((item) => {
          const dateCounts = {};
          item.clicks.forEach((click) => {
            const date = new Date(click.timestamp).toISOString().split("T")[0];
            dateCounts[date] = (dateCounts[date] || 0) + 1;
          });
          return Object.entries(dateCounts).map(([date, clicks]) => ({
            date,
            clicks,
          }));
        });

        const flattenedData = aggregatedData.flat();
        const groupedData = flattenedData.reduce((acc, curr) => {
          const existing = acc.find((item) => item.date === curr.date);
          if (existing) {
            existing.clicks += curr.clicks;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Device-wise aggregation
        const deviceCounts = {};
        rawData.forEach((item) => {
          item.clicks.forEach((click) => {
            const device = click.device || "Unknown"; // Default to "Unknown" if device is missing
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
          });
        });

        const deviceData = Object.entries(deviceCounts).map(
          ([device, clicks]) => ({
            device,
            clicks,
          })
        );

        setGraphData(groupedData); // Date-wise graph data
        setDeviceGraphData(deviceData); // Device-wise graph data
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home");
    }
    fetchUserName();
    fetchGraphData();
  }, [location.pathname, navigate]);

  return (
    <div className="mainbody">
      <div className="vr"></div>
      <div className="sidebar">
        <div className="sidebar-logo">
          <img className="logos" src={logo} alt="" />
        </div>
        <div className="sidebar-items-container">
          <div className="sidebar-items">
            <Link to="/home" className={getSidebarItemClass("/home")}>
              <span>
                <i className="ri-home-3-line icons"></i>
              </span>
              <h3 className="texts">Dashboard</h3>
            </Link>

            <Link to="/links" className={getSidebarItemClass("/links")}>
              <span>
                <i className="ri-links-line icons"></i>
              </span>
              <h3 className="texts">Links</h3>
            </Link>
            <Link to="/analytics" className={getSidebarItemClass("/analytics")}>
              <span>
                <i className="ri-line-chart-fill icons"></i>
              </span>
              <h3 className="texts">Analytics</h3>
            </Link>
          </div>
          <div className="settings">
            <Link to="/settings" className={getSidebarItemClass("/settings")}>
              <span>
                <i className="ri-settings-3-line icons"></i>
              </span>
              <h3 className="texts">Settings</h3>
            </Link>
          </div>
        </div>
      </div>
      <div className="navbar">
        <div className="searchbar">
          <div>
            <Greet />
          </div>
          <div>
            <SearchComponent />
          </div>
          <div className="profilecont">
            <div className="profile" onClick={toggleDropdown}>
              <h1 className="usertext">{name.trim().substring(0, 2)}</h1>
            </div>

            {isDropdownVisible && (
              <div className="profile-dropdown">
                <button
                  className="logout"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="maintexts">
          <h2
            style={{
              color: "#1b48da",
              margin: "3rem 0",
              fontFamily: "Manrope",
            }}
          >
            Total Clicks:{" "}
            {graphData.reduce((acc, curr) => acc + curr.clicks, 0)}
          </h2>
          <div className="graphcontainer">
            <div className="clickdashboard">
              <h4 className="device">Date-wise Clicks</h4>
              <ResponsiveContainer
                width="100%"
                height={
                  graphData.length >= 5
                    ? 400
                    : graphData.length >= 2
                    ? 300
                    : 100
                }
                className={graphData.length >= 5 ? "scroll-container" : ""}
              >
                <BarChart
                  data={[...graphData].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                  )}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                  barCategoryGap={15}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="date"
                    width={80}
                    tick={{
                      fontFamily: "Manrope",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                    tickFormatter={(date) => {
                      const [year, month, day] = date.split("-");
                      return `${day}-${month}-${year}`;
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar
                    dataKey="clicks"
                    fill="#1b48da"
                    barSize={24}
                    radius={[0, 8, 8, 0]}
                  >
                    <LabelList
                      dataKey="clicks"
                      position="right"
                      style={{
                        fontWeight: "700",
                        fontSize: "14px",
                        fill: "#000",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="devicegraph">
              <h4 className="device">Click Devices</h4>
              <ResponsiveContainer
                width="100%"
                height={
                  deviceGraphData.length >= 5
                    ? 400
                    : deviceGraphData.length > 2
                    ? 300
                    : 100
                }
                className={
                  deviceGraphData.length >= 5 ? "scroll-container" : ""
                }
              >
                <BarChart
                  data={deviceGraphData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                  barCategoryGap={0}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="device"
                    type="category"
                    tick={{
                      fontFamily: "Manrope",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar
                    dataKey="clicks"
                    fill="#1b48da"
                    barSize={24}
                    radius={[0, 8, 8, 0]}
                  >
                    <LabelList
                      dataKey="clicks"
                      position="right"
                      style={{
                        fontWeight: "700",
                        fontSize: "12px",
                        fill: "#000",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
