import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Greet.css";

const Greet = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentTime = new Date();
  const hours = currentTime.getHours();
  const dayOfWeek = currentTime.toLocaleString("en-us", { weekday: "short" });
  const month = currentTime.toLocaleString("en-us", { month: "short" });
  const date = currentTime.getDate();

  let greeting = "";
  let avatarUrl = "";

  // Corrected time range checks
  if (hours >= 6 && hours < 12) {
    greeting = "Good morning";
    avatarUrl = "☀️";
  } else if (hours >= 12 && hours < 18) {
    greeting = "Good afternoon";
    avatarUrl = "🌤️";
  } else if (hours >= 18 && hours < 22) {
    greeting = "Good evening";
    avatarUrl = "🌃";
  } else {
    greeting = "Good night";
    avatarUrl = "🌙";
  }

  const formattedDate = `${dayOfWeek}, ${month} ${date}`;

  const fetchUserName = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        const fetchedName = response.data.data.username;
        setName(fetchedName);
      }
    } catch (err) {
      setError("Failed to load name");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const truncatedName =
    name.length > 7 ? name.trim().substring(0, 7) + "..." : name;

  return (
    <div className="greetcontainer">
      <div className="greet">
        <span
          className="user-avatar"
          style={{ fontSize: "2rem", marginLeft: "10px" }}
        >
          {avatarUrl} {/* Emoji avatar */}
        </span>
        <div>
          <h1 className="headings">
            {greeting}, {truncatedName}
          </h1>
          <p className="date">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Greet;
