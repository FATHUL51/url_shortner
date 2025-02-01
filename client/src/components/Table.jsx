import React, { useEffect, useState } from "react";
import axios from "axios";
import Toggle from "../assets/images/Toggle";
import PaginationComponent from "../components/PaginationComponent";

const ClicksTable = () => {
  const [clicksData, setClicksData] = useState([]);
  const [pagination, setPagination] = useState({
    totalClicks: 0,
    currentPage: 1,
    totalPages: 0,
  });
  const [sortOrder, setSortOrder] = useState("desc");
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    // Initialize rowsPerPage based on initial screen width
    const screenWidth = window.innerWidth;
    if (screenWidth <= 767) return 3;
    if (screenWidth <= 1023) return 5;
    return 8;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch clicks data with pagination and sorting
  const fetchClicksData = async (
    page = 1,
    sort = "desc",
    limit = rowsPerPage
  ) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/clicks`,
        {
          params: {
            page,
            limit,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        let sortedClicks = response.data.data.clicks;

        // Sort the data
        sortedClicks = sortedClicks.sort((a, b) => {
          const comparison = new Date(b.timestamp) - new Date(a.timestamp);
          return sort === "desc" ? comparison : -comparison;
        });

        setClicksData(sortedClicks);
        setPagination({
          ...response.data.data.pagination,
          totalPages: Math.ceil(
            response.data.data.pagination.totalClicks / limit
          ),
        });
      }
    } catch (err) {
      console.error("Error fetching clicks data:", err);
    }
  };

  // Handle responsive row count
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      let newRowsPerPage;

      if (screenWidth <= 767) {
        newRowsPerPage = 3;
      } else if (screenWidth <= 1024) {
        newRowsPerPage = 5;
      } else {
        newRowsPerPage = 8;
      }

      if (newRowsPerPage !== rowsPerPage) {
        setRowsPerPage(newRowsPerPage);
        setPagination((prev) => ({
          ...prev,
          currentPage: 1,
        }));
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Set initialization flag
    if (!isInitialized) {
      setIsInitialized(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [rowsPerPage]);

  // Initial data fetch and subsequent updates
  useEffect(() => {
    if (isInitialized) {
      fetchClicksData(pagination.currentPage, sortOrder, rowsPerPage);
    }
  }, [pagination.currentPage, sortOrder, rowsPerPage, isInitialized]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="table-with-search">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={handleSort} style={{ cursor: "pointer" }}>
                Timestamp
                <Toggle />
              </th>
              <th style={{ width: "25%" }}>Original Link</th>
              <th>Short Link</th>
              <th>IP Address</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {clicksData.length > 0 ? (
              clicksData.map((click, index) => {
                const {
                  timestamp,
                  ipAddress,
                  device,
                  os,
                  redirectURL,
                  shortId,
                } = click;
                const formattedTimestamp = new Date(timestamp).toLocaleString(
                  "en-IN",
                  {
                    timeZone: "Asia/Kolkata",
                    hour12: true,
                  }
                );

                return (
                  <tr key={index}>
                    <td>{formattedTimestamp}</td>
                    <td style={{ wordBreak: "break-all" }}>{`${redirectURL}`.slice(0,25)}</td>
                    <td>{`https://url-shortner-snq5.onrender.com/api/user/${shortId}`.slice(0,25)}</td>
                    <td>{ipAddress}</td>
                    <td>
                      {device}
                      <br />
                      {os}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No clicks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationComponent
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ClicksTable;
