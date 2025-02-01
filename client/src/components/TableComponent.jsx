import React, { useState, useEffect, useCallback } from "react";
import "./TableComponent.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Copy from "../assets/images/Copy";
import axios from "axios";
import PaginationComponent from "./PaginationComponent";
import Toggle from "../assets/images/Toggle";
import EditImage from "../assets/images/EditImage";
import Delete from "../assets/images/Delete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import img from "../assets/Calendar Outline Icons.webp";

const TableWithSearchComponent = ({ links, refreshLinks }) => {
  const minDate = new Date();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) return 3;
    if (screenWidth <= 1024) return 6;
    return 8;
  });
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
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [pagination, setPagination] = useState({
    totalClicks: 0,
    currentPage: 1,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("newToOld");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleResize = useCallback(() => {
    const screenWidth = window.innerWidth;
    let newRowsPerPage;

    if (screenWidth <= 768) {
      newRowsPerPage = 3; // Mobile: 3 rows
    } else if (screenWidth <= 1024) {
      newRowsPerPage = 6; // Tablet: 6 rows
    } else {
      newRowsPerPage = 8; // Desktop: 8 rows
    }

    if (newRowsPerPage !== rowsPerPage) {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const screenWidth = window.innerWidth;
    let newRowsPerPage;

    if (screenWidth <= 768) {
      newRowsPerPage = 3; // Mobile: 3 rows
    } else if (screenWidth <= 1024) {
      newRowsPerPage = 6; // Tablet: 6 rows
    } else {
      newRowsPerPage = 8; // Desktop: 8 rows
    }

    setRowsPerPage(newRowsPerPage);
  }, []);

  const toggleDropdownn = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleStatusFilterChange = (e) => {
    e.stopPropagation();
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".dropdown-select")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const filterLinks = useCallback(() => {
    let filtered = [...links];

    if (statusFilter !== "all") {
      filtered = filtered.filter((link) => {
        const status =
          link.expirationdate && new Date(link.expirationdate) < new Date()
            ? "Inactive"
            : "Active";
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (dateFilter === "newToOld") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredLinks(filtered);
  }, [links, statusFilter, dateFilter]);

  useEffect(() => {
    filterLinks();
  }, [filterLinks]);

  const handleDateFilterChange = () => {
    setDateFilter((prev) => (prev === "newToOld" ? "oldToNew" : "newToOld"));
    setCurrentPage(1);
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

  const handleDateChange = (date) => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    setDate(formattedDate);
  };

  const fetchLinks = useCallback(async () => {
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
        const linksData = response.data.data || [];
        const formattedLinks = linksData.map((link) => ({
          ...link,
          expirationdate: link.expirationdate
            ? new Date(link.expirationdate).toISOString().split("T")[0]
            : null,
        }));

        setFilteredLinks(formattedLinks);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  }, [currentPage, rowsPerPage]);

  const handleCheckboxChange = () => {
    setIsLinkExpired(!isLinkExpired);
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
      if (refreshLinks) refreshLinks();
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
        fetchLinks();
      }

      closeDeleteConfirmation();
      if (refreshLinks) refreshLinks();
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

  useEffect(() => {
    setFilteredLinks(
      links.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    );
  }, [links, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="table-with-search">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={handleDateFilterChange}>
                Date
                <span>
                  <Toggle />
                </span>
              </th>
              <th style={{ width: "25%" }}>Original Link</th>
              <th>Short Link</th>
              <th>Remarks</th>
              <th>Clicks</th>
              <th style={{ position: "relative" }} onClick={toggleDropdownn}>
                Status{" "}
                <span>
                  <Toggle className="toogle" />
                </span>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="dropdown-select"
                      onClick={(e) => e.stopPropagation()}
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
            {filteredLinks.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No data available
                </td>
              </tr>
            ) : (
              filteredLinks.map((row) => {
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
                    <td style={{ wordBreak: "break-all" }}>
                      {`${row.redirectURL}`.slice(0.25)}
                    </td>
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
                              text: `✓ Link Copied`,
                              duration: 3000,
                              gravity: "bottom",
                              position: "left",
                              style: {
                                background: "white",
                                color: "#2F80ED",
                                border: "1px solid #2F80ED",
                                borderRadius: "12px",
                                padding: "0.5rem 2.5rem",
                                display: "flex",
                                alignItems: "center",
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
              })
            )}
          </tbody>
        </table>

        {isDeleteConfirmationVisible && (
          <div className="delete-dropdowns">
            <h3 onClick={closeDeleteConfirmation}>
              <i className="ri-close-line crosss"></i>
            </h3>
            <div className="delete-heading">
              <p className="delete-text">Are you sure you want to remove it?</p>
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
                  disabled
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

              <div>
                {isLinkExpired && (
                  <div className="datepicker-container">
                    <DatePicker
                      selected={date ? new Date(date) : null}
                      minDate={minDate}
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="originallink custom-input"
                      popperPlacement="top-start"
                      placeholderText="dd-mm-yyyy"
                      showPopperArrow={false}
                      calendarClassName="calendar"
                    />
                    <img className="calenderimage" src={img} alt="" />
                  </div>
                )}
              </div>

              <div className="buttonkatil">
                <button className="clear" onClick={handleClear}>
                  Clear
                </button>
                <button className="crtnew" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TableWithSearchComponent;
