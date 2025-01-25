import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Table.css";

const Table = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  // Fetch analytics data from the backend
  const fetchAnalyticsData = async () => {
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
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Flatten and sort analytics data by timestamp (newest first)
  const flattenedData = analyticsData
    .flatMap((entry) =>
      entry.clicks.map((click) => ({
        timestamp: click.timestamp,
        redirectURL: entry.redirectURL,
        shortId: entry.shortId,
        ipAddress: click.ipAddress,
        device: click.device,
        os: click.os,
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp (newest first)

  // Calculate rows to display for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = flattenedData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(flattenedData.length / rowsPerPage);

  // Handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="analytics-container">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Original Link</th>
            <th>Short Link</th>
            <th>IP Address</th>
            <th>Device</th>
            <th>OS</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((row, index) => (
              <tr key={index}>
                <td style={{ border: "none" }}>
                  {row.timestamp
                    ? new Date(row.timestamp).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })
                    : "N/A"}
                </td>
                <td>{row.redirectURL}</td>
                <td>{`https://url-shortner-snq5.onrender.com/api/user/${row.shortId}`}</td>
                <td>{row.ipAddress}</td>
                <td>{row.device}</td>
                <td>{row.os}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Styled Pagination */}
      <div className="pagination">
        {/* Previous Button */}
        <button
          className="page-button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {/* First Page */}
        {currentPage > 2 && (
          <>
            <button
              className={`page-button ${currentPage === 1 ? "active" : ""}`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {currentPage > 3 && <span className="ellipsis">...</span>}
          </>
        )}

        {/* Pages Around Current Page */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === currentPage ||
              page === currentPage - 1 ||
              page === currentPage + 1
          )
          .map((page) => (
            <button
              key={page}
              className={`page-button ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

        {/* Last Page */}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <span className="ellipsis">...</span>
            )}
            <button
              className={`page-button ${
                currentPage === totalPages ? "active" : ""
              }`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          className="page-button"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Table;
