import React from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Make sure to import the CSS

const MyComponent = () => {
  const showToast = () => {
    Toastify({
      text: `
        <div style="display: flex; align-items: center;">
          <!-- Blue rounded checkmark icon -->
          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #2F80ED; color: white; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
            ✔
          </div>
          <!-- Success message -->
          <span>Link Copied</span>
        </div>
      `,
      duration: 3000,
      gravity: "bottom",
      position: "left",
      style: {
        background: "#2F80ED", // Blue background for the toast
        color: "white", // White text for the message
        borderRadius: "12px",
        padding: "0.5rem 2.5rem",
        display: "flex",
        alignItems: "center",
      },
    }).showToast();
  };

  return (
    <div>
      <button onClick={showToast}>Copy Link</button>
    </div>
  );
};

export default MyComponent;
