import React, { useState } from "react";
import "./Search.css";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search">
      <button className="createstyle" onClick={toggleDropdown}>
        <span className="span">+</span> Create new
      </button>
      {isDropdownVisible && (
        <div className="dropdown">
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
