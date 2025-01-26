import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import { Link } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const SearchComponent = ({ onSearch, refreshLinks }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [originalLink, setOriginalLink] = useState("");
  const [remark, setRemark] = useState("");
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({ originalLink: false, remark: false });
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    navigate("/links");

    if (onSearch) {
      onSearch(query);
    }
  };

  const handleOriginalLinkChange = (e) => {
    setOriginalLink(e.target.value);
    if (e.target.value.trim() !== "") {
      setErrors((prev) => ({ ...prev, originalLink: false }));
    }
  };

  const handleRemarkChange = (e) => {
    setRemark(e.target.value);
    if (e.target.value.trim() !== "") {
      setErrors((prev) => ({ ...prev, remark: false }));
    }
  };

  const handleDateChange = (e) => {
    console.log("Selected Date:", e.target.value); // Check the date value
    setDate(e.target.value);
  };

  const handleCheckboxChange = () => {
    setIsLinkExpired(!isLinkExpired);
  };

  const handleCreateNew = async () => {
    const hasErrors = {
      originalLink: originalLink.trim() === "",
      remark: remark.trim() === "",
    };

    if (hasErrors.originalLink || hasErrors.remark) {
      setErrors(hasErrors);
      Toastify({
        text: "Please fill out all required fields.",
      }).showToast();
      return;
    }

    const payload = {
      originalLink,
      remark,
      expirationdate: isLinkExpired && date ? date : null,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/url`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        Toastify({
          text: "Link created successfully!",
        }).showToast();

        // Refresh the links (table) after successful creation
        if (refreshLinks) refreshLinks(); // Ensure this triggers a state update in the parent

        // Reset form fields
        setIsDropdownVisible(false);
        setOriginalLink("");
        setRemark("");
        setDate("");
        setIsLinkExpired(false);
      } else {
        Toastify({
          text: "Failed to create link. Please try again.",
        }).showToast();
      }
    } catch (error) {
      console.error("Error creating link:", error);

      Toastify({
        text: "Failed to create link. Please try again.",
      }).showToast();
    }
  };

  const handleClear = () => {
    setOriginalLink("");
    setRemark("");
    setDate("");
    setIsLinkExpired(false);
    setErrors({ originalLink: false, remark: false });
  };

  return (
    <div className="search">
      <button className="createstyle" onClick={toggleDropdown}>
        <span className="span">+</span> Create new
      </button>

      {isDropdownVisible && (
        <div className="createsection">
          <div className="dropdown-header">
            <h3 className="h3">New Link</h3>
            <span onClick={closeDropdown}>
              <i className="ri-close-line closed"></i>
            </span>
          </div>

          <div className="dropdown-body">
            <div>
              <h3 className="h3">
                Destination Url <span className="p">*</span>
              </h3>
              <input
                required
                className={`originallink ${errors.originalLink ? "error" : ""}`}
                type="text"
                value={originalLink}
                placeholder="https://web.whatsapp.com/"
                onChange={handleOriginalLinkChange}
              />
            </div>

            <div>
              <h3 className="h3">
                Remarks <span className="p">*</span>
              </h3>
              <input
                required
                className={`remarks ${errors.remark ? "error" : ""}`}
                type="text"
                value={remark}
                placeholder="Add remarks"
                onChange={handleRemarkChange}
              />
            </div>

            <div className="Linksbattle">
              <h3 className="h3">Link Expiration</h3>
              <div className="checkbox-apple">
                <input
                  className="yep"
                  id="check-apple"
                  type="checkbox"
                  checked={isLinkExpired}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="check-apple"></label>
              </div>
            </div>

            {isLinkExpired && (
              <div>
                <input
                  className="originallink"
                  value={date}
                  onChange={handleDateChange}
                  type="date"
                />
              </div>
            )}

            <div className="buttonkatil">
              <button className="clear" onClick={handleClear}>
                Clear
              </button>
              <button className="crtnew" onClick={handleCreateNew}>
                Create new
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="search-container">
        <i className="ri-search-line iconx"></i>
        <input
          className="filter"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by remarks..."
        />
      </div>
    </div>
  );
};

export default SearchComponent;
