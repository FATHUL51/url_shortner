import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import Calender from "../assets/images/Calender";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [originalLink, setOriginalLink] = useState("");
  const [remark, setRemark] = useState("");
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    navigate("/links");
  };

  const handleOriginalLinkChange = (e) => {
    setOriginalLink(e.target.value);
  };

  const handleRemarkChange = (e) => {
    setRemark(e.target.value);
  };
  const handledatechnage = (e) => {
    setDate(e.target.value);
  };

  const handleCheckboxChange = () => {
    setIsLinkExpired(!isLinkExpired);
  };

  return (
    <div className="search">
      <button className="createstyle" onClick={toggleDropdown}>
        <span className="span">+</span> Create new
      </button>

      {/* Dropdown Section */}
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
                className="originallink"
                type="text"
                value={originalLink}
                placeholder="https://web.whatsapp.com/"
                onChange={handleOriginalLinkChange}
              />
            </div>

            <div className="dropdown-body">
              <h3 className="h3">
                Remarks <span className="p">*</span>
              </h3>
              <input
                required
                className="remarks"
                type="text"
                value={remark}
                placeholder="Add remarks"
                onChange={handleRemarkChange}
              />
            </div>

            <div>
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
              <div>
                <input
                  className="originallink"
                  value={date}
                  onChange={handledatechnage}
                  type="date"
                />
              </div>
            </div>
            <div className="buttonkatil">
              <button className="clear">Clear</button>
              <button className="crtnew">Create new</button>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="search-container">
        <i className="ri-search-line iconx"></i>
        <input
          className="filter"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
      </div>
    </div>
  );
};

export default SearchComponent;
