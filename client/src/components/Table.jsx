import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Table.css";
import PaginationComponent from "./PaginationComponent";
import Toggle from "../assets/images/Toggle";

const Table = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("newToOld");

  useEffect(() => {
    const updateRowsPerPage = () => {
      if (window.innerWidth <= 768) {
        setRowsPerPage(4);
      } else if (window.innerWidth <= 1023) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(10);
      }
    };

    updateRowsPerPage(); // Set initial rowsPerPage
    window.addEventListener("resize", updateRowsPerPage);

    return () => {
      window.removeEventListener("resize", updateRowsPerPage);
    };
  }, []);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    console.log("Page changed to:", pageNumber);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Flatten and sort analytics data by timestamp (newest first or oldest first)
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
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      // Apply the dateFilter sorting logic
      if (dateFilter === "newToOld") {
        return dateB - dateA; // New to Old (descending)
      } else {
        return dateA - dateB; // Old to New (ascending)
      }
    });

  // Calculate rows to display for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = flattenedData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(flattenedData.length / rowsPerPage);

  // Handle date filter changes
  const handleDateFilterChange = () => {
    setDateFilter((prev) => (prev === "newToOld" ? "oldToNew" : "newToOld"));
    setCurrentPage(1); // Reset to page 1 when changing filter
  };

  return (
    <div className="table-with-search">
      <div className="table-container">
        <>
          <table>
            <thead>
              <tr>
                <th>
                  Timestamp
                  <span onClick={handleDateFilterChange}>
                    <Toggle />
                  </span>
                  {"  "}
                </th>
                <th>Original Link</th>
                <th>Short Link</th>
                <th>IP Address</th>
                <th>Device</th>
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
                    <td>
                      {row.device} {row.os}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
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

export default Table;
