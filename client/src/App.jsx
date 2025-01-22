import React from "react";
import { Routes, Route } from "react-router-dom";
import UserProtectedWrapper from "./Pages/UserProtectedWrapper";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
