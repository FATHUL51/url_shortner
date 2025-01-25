import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableComponent.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Copy from "../assets/images/Copy";

const TableWithSearchComponent = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const rowsPerPage = 9;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [originalLink, setOriginalLink] = useState("");
  const [remark, setRemark] = useState("");
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [date, setDate] = useState("");
  // Number of rows per page

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/url`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTableData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const closeDropdown = () => {
    setIsDropdownVisible(false);
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

  // Filtered and paginated table data
  const filteredData = tableData.filter((row) =>
    row.redirectURL.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="table-with-search">
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Original Link</th>
                  <th>Short Link</th>
                  <th>Remarks</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => {
                  const status =
                    row.expirationDate &&
                    new Date(row.expirationDate) < new Date()
                      ? "Inactive"
                      : "Active";

                  return (
                    <tr key={row._id}>
                      <td>
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                              }
                            )
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
                                close: false,
                                gravity: "bottom",
                                position: "left",
                                stopOnFocus: true,
                                style: {
                                  left: "10rem",
                                  bottom: "2rem",
                                  background: "white",
                                  color: "#2F80ED",
                                  border: "1px solid #2F80ED",
                                  borderRadius: "12px",
                                  fontWeight: "500",
                                  fontSize: "16px",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                },
                              }).showToast();
                            }}
                          >
                            <Copy
                              style={{
                                cursor: "pointer",
                              }}
                            />
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
                        <button className="edit" onClick={toggleDropdown}>
                          Edit
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
                        <button className="delete">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-button ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableWithSearchComponent;
