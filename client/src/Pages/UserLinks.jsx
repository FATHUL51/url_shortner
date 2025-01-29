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
import TableComponent from "../components/TableComponent";
import Dashboardss from "../assets/images/dashboard";
import LinkImage from "../assets/images/LinkImage";
import SettingImage from "../assets/images/SettingImage";
import AnalyticsImage from "../assets/images/AnalyticsImage";

const UserLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [name, setName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allLinks, setAllLinks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

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

  const fetchLinks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/url`,
        {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setAllLinks(response.data.data || []);
        setSearchResults(response.data.data || []); // Initialize search results
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(allLinks); // Reset to all links when search is cleared
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/`,
        {
          params: { query },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setSearchResults([]);
    }
  };
  const refreshLinks = () => {
    fetchLinks(); // Refresh the links after an edit or delete
  };

  useEffect(() => {
    fetchUserName();
    fetchLinks();
  }, []);

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
              <Dashboardss />
              <h3 className="texts">Dashboard</h3>
            </Link>
            <Link to="/links" className={getSidebarItemClass("/links")}>
              <LinkImage />
              <h3 className="texts">Links</h3>
            </Link>
            <Link to="/analytics" className={getSidebarItemClass("/analytics")}>
              <AnalyticsImage />
              <h3 className="texts">Analytics</h3>
            </Link>
          </div>
          <div className="settings">
            <Link to="/settings" className={getSidebarItemClass("/settings")}>
              <SettingImage />
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
            <SearchComponent
              onSearch={handleSearch}
              refreshLinks={refreshLinks}
            />
          </div>
          <div className="profilecont">
            <div className="profile" onClick={toggleDropdown}>
              <h1 className="usertext">{name.trim().substring(0, 2)}</h1>
            </div>
            {isDropdownVisible && (
              <div className="profile-dropdown">
                <button className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <TableComponent links={searchResults} refreshLinks={refreshLinks} />
      </div>
    </div>
  );
};

export default UserLinks;
