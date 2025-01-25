import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableComponent.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const TableWithSearchComponent = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const rowsPerPage = 9; // Number of rows per page

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
                          <i
                            className="ri-file-copy-line"
                            style={{
                              fontSize: "1.5rem",
                              cursor: "pointer",
                            }}
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
                          ></i>
                        </span>
                      </td>
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
                        <button className="edit">Edit</button>
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
