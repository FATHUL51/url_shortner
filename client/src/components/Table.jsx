import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Table.css";

const Table = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  // Fetch analytics data from backend
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

  // Calculate the rows to display for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = analyticsData
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
    .slice(startIndex, endIndex);

  const totalPages = Math.ceil(
    analyticsData.reduce((sum, entry) => sum + entry.clicks.length, 0) /
      rowsPerPage
  );

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
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
                <td>{`https://url-shortner-snq5.onrender.com/${row.shortId}`}</td>
                <td>
                  {row.ipAddress
                    ? row.ipAddress.trim().substring(0, 12)
                    : "N/A"}
                </td>
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
        <button
          className="page-button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {generatePageNumbers().map((pageNumber) => (
          <button
            key={pageNumber}
            className={`page-button ${
              pageNumber === currentPage ? "active" : ""
            }`}
            onClick={() => setCurrentPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
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
