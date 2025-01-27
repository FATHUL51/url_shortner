import React, { useState, useEffect } from "react";
import "./TableComponent.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Copy from "../assets/images/Copy";
import axios from "axios";
import PaginationComponent from "./PaginationComponent";
import Toggle from "../assets/images/Toggle";
import EditImage from "../assets/images/EditImage";
import Delete from "../assets/images/Delete";

const TableWithSearchComponent = ({ links, refreshLinks }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [originalLink, setOriginalLink] = useState("");
  const [errors, setErrors] = useState({ originalLink: false, remark: false });
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const [remark, setRemark] = useState("");
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [date, setDate] = useState("");
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);
  const [allLinks, setAllLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // active/inactive filter
  const [dateFilter, setDateFilter] = useState("newToOld");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalPages = Math.ceil(filteredLinks.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredLinks.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setRowsPerPage(4);
      } else if (window.innerWidth >= 600 && window.innerWidth <= 1023) {
        setRowsPerPage(4);
      } else {
        setRowsPerPage(10);
      }
    };
    handleResize(); // Set the initial rowsPerPage
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to toggle dropdown visibility
  const toggleDropdownn = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status); // Ensure statusFilter is updated correctly
    setCurrentPage(1); // Reset to page 1 when changing filter
  };

  // Filter links based on status and date
  const filterLinks = () => {
    let filtered = [...links];

    // Filter by status (Active/Inactive)
    if (statusFilter !== "all") {
      filtered = filtered.filter((link) => {
        const status =
          link.expirationdate && new Date(link.expirationdate) < new Date()
            ? "Inactive"
            : "Active";
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Sort by date (newToOld or oldToNew)
    if (dateFilter === "newToOld") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredLinks(filtered);
  };

  // Filter by date handler
  const handleDateFilterChange = () => {
    setDateFilter((prev) => (prev === "newToOld" ? "oldToNew" : "newToOld"));
    setCurrentPage(1); // Reset to page 1 when changing filter
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleDropdown = (link) => {
    setOriginalLink(link.redirectURL);
    setRemark(link.remarks);
    setDate(link.expirationdate ? link.expirationdate : "");
    setIsLinkExpired(link.expirationdate ? true : false);
    setEditingLinkId(link._id);
    setIsDropdownVisible(true);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
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
    const newDate = e.target.value; // e.g., 2025-01-01
    console.log("Selected Date (yyyy-mm-dd):", newDate); // Check if the date is in the right format
    setDate(newDate); // Update state with the new date in yyyy-mm-dd format
  };

  const handleCheckboxChange = () => {
    setIsLinkExpired(!isLinkExpired);
  };

  const fetchLinks = async () => {
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
        const linksData = response.data.data || [];
        const formattedLinks = linksData.map((link) => ({
          ...link,
          expirationdate: link.expirationdate
            ? new Date(link.expirationdate).toISOString().split("T")[0]
            : null,
        }));
        setAllLinks(formattedLinks);
        setFilteredLinks(formattedLinks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setOriginalLink("");
    setRemark("");
    setDate("");
    setIsLinkExpired(false);
    setErrors({ originalLink: false, remark: false });
  };

  const handleSave = async () => {
    if (!originalLink.trim() || !remark.trim()) {
      Toastify({
        text: "Original Link and Remark are required.",
      }).showToast();
      return;
    }

    const payload = {
      originalLink,
      remark,
      expirationdate: isLinkExpired ? date : null,
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/url/${editingLinkId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Toastify({
        text: "Link updated successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();

      closeDropdown();
      if (refreshLinks) refreshLinks(); // Refresh the table data after update
    } catch (error) {
      console.error("Error updating link:", error);
      Toastify({
        text: "Failed to update the link. Please try again.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF5733",
      }).showToast();
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/url/${deletingLinkId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status === 200) {
        Toastify({
          text: "Link deleted successfully!",
        }).showToast();

        // Call fetchLinks again to update the table
        fetchLinks();
      }

      closeDeleteConfirmation();
      if (refreshLinks) refreshLinks(); // Refresh the table data after deletion
    } catch (error) {
      console.error("Error deleting link:", error);
      Toastify({
        text: "Failed to delete the link. Please try again.",
      }).showToast();
    }
  };

  const showDeleteConfirmation = (linkId) => {
    setDeletingLinkId(linkId);
    setIsDeleteConfirmationVisible(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible(false);
    setDeletingLinkId(null);
  };
  const handleLinkData = (link) => {
    setOriginalLink(link.redirectURL);
    setRemark(link.remarks);

    // Ensure the expiration date is in the correct format
    const formattedDate = link.expirationdate
      ? new Date(link.expirationdate).toISOString().split("T")[0]
      : "";

    setDate(formattedDate);
    setIsLinkExpired(link.expirationdate ? true : false);
    setEditingLinkId(link._id);
    setIsDropdownVisible(true);
  };
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const convertToInputDateFormat = (date) => {
    if (!date) return "";
    const [day, month, year] = date.split("-"); // Assume format is dd-mm-yyyy
    return `${year}-${month}-${day}`; // Convert to yyyy-mm-dd
  };

  useEffect(() => {
    filterLinks();
  }, [links, statusFilter, dateFilter]);

  return (
    <div className="table-with-search">
      <div className="table-container">
        <>
          <table>
            <thead>
              <tr>
                <th>
                  Date
                  <span onClick={handleDateFilterChange}>
                    <Toggle />
                  </span>
                </th>
                <th>Original Link </th>
                <th>Short Link</th>
                <th>Remarks</th>
                <th>Clicks</th>
                <th
                  style={{
                    display: "flex",
                    position: "relative",
                  }}
                >
                  Status{" "}
                  <span onClick={toggleDropdownn}>
                    <Toggle />
                  </span>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          handleStatusFilterChange(e.target.value)
                        }
                        className="dropdown-select"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => {
                const status =
                  row.expirationdate &&
                  new Date(row.expirationdate) < new Date()
                    ? "Inactive"
                    : "Active";

                return (
                  <tr key={row._id}>
                    <td>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })
                        : "N/A"}
                    </td>
                    <td>{row.redirectURL}</td>
                    <td>
                      <span className="copy-button">
                        {`https://url-shortner-snq5.onrender.com/api/user/${row.shortId}`.slice(
                          0,
                          7
                        )}
                        ...
                        <span
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://url-shortner-snq5.onrender.com/api/user/${row.shortId}`
                            );
                            Toastify({
                              text: "✅ Link Copied",
                              duration: 3000,
                              gravity: "bottom",
                              position: "left",
                              style: {
                                background: "white",
                                color: "#2F80ED",
                                border: "1px solid #2F80ED",
                                borderRadius: "12px",
                                padding: " 0.5rem 2.5rem",
                              },
                            }).showToast();
                          }}
                        >
                          <Copy style={{ cursor: "pointer" }} />
                        </span>
                      </span>
                    </td>
                    <td>{row.remarks}</td>
                    <td>{row.clicks.length}</td>
                    <td
                      className={
                        status.toLowerCase() === "active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {status}
                    </td>
                    <td>
                      <div className="editanddelete">
                        <button
                          className="edit"
                          onClick={() => toggleDropdown(row)}
                        >
                          <EditImage />
                        </button>
                        <button
                          className="delete"
                          onClick={() => showDeleteConfirmation(row._id)}
                        >
                          <Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isDeleteConfirmationVisible && (
            <div className="delete-dropdowns">
              <h3 onClick={closeDeleteConfirmation}>
                <i className="ri-close-line crosss"></i>
              </h3>
              <div className="delete-heading">
                <p className="delete-text">
                  Are you sure you want to remove it?
                </p>
                <div className="delete-container">
                  <button className="dltbtn1" onClick={closeDeleteConfirmation}>
                    No
                  </button>
                  <button className="dltbtn" onClick={handleDelete}>
                    YES
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDropdownVisible && (
            <div className="createsection">
              <div className="dropdown-header">
                <h3 className="h3">Edit Link</h3>
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
                    className={`originallink ${
                      errors.originalLink ? "error" : ""
                    }`}
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
                    {/* Displaying the date in dd-mm-yyyy format */}
                    <input
                      className="originallink"
                      value={formatDateForDisplay(date)} // Shows dd-mm-yyyy
                      onChange={handleDateChange}
                      type="text" // You can use text input to display the formatted date
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                )}

                <div className="buttonkatil">
                  <button className="clear" onClick={handleClear}>
                    Clear
                  </button>
                  <button className="crtnew" onClick={handleSave}>
                    save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
      <div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default TableWithSearchComponent;
