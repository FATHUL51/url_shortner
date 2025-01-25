import React from "react";

const AnalyticsImage = () => {
  return (
    <div style={{ display: "flex" }}>
      <svg
        className="dashboard"
        width="25"
        height="25"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 14.1667L7.5 9.16671L10.8333 12.5L17.5 5.83337"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.6666 5.83337H17.5V11.6667"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default AnalyticsImage;
