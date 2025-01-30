import React from "react";
import { Routes, Route } from "react-router-dom";
import UserProtectedWrapper from "./Pages/UserProtectedWrapper";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import UserLinks from "./Pages/UserLinks";
import Analytics from "./Pages/Analytics";
import Settings from "./Pages/Settings";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route
          path="/home"
          element={
            <UserProtectedWrapper>
              <Home />
            </UserProtectedWrapper>
          }
        />
        <Route
          path="/links"
          element={
            <UserProtectedWrapper>
              <UserLinks />
            </UserProtectedWrapper>
          }
        />
        <Route
          path="/analytics"
          element={
            <UserProtectedWrapper>
              <Analytics />
            </UserProtectedWrapper>
          }
        />
        <Route
          path="/settings"
          element={
            <UserProtectedWrapper>
              <Settings />
            </UserProtectedWrapper>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
