import React from "react";

const Toggle = () => {
  return (
    <div style={{ display: "inline-flex", position: "relative" }}>
      <svg
        style={{
          position: "absolute",
          top: "-15px",
          left: "5px",
        }}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.3999 8L10.1999 4.8L6.9999 8"
          stroke="#3B3C51"
          strokeWidth="0.853333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 11.9999L10.2 15.1999L13.4 11.9999"
          stroke="#3B3C51"
          strokeWidth="0.853333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Toggle;
