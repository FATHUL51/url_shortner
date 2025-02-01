import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import image from "../assets/m_image.svg";
import logo from "../assets/Cuvette MERN Final Evaluation Jan 25.svg";
import "./Signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpass, setConfirmpass] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    if (password !== confirmpass) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }, [password, confirmpass]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const newUser = { username, email, mobile, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
        newUser
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        Toastify({
          text: "User created successfully",
        }).showToast();
        navigate("/Login");
      }
    } catch (error) {
      if (error.response) {
        Toastify({
          text: error.response.data.message || "Something went wrong!",
        }).showToast();
      } else if (error.request) {
        Toastify({
          text: "No response from the server. Please try again later.",
        }).showToast();
      } else {
        Toastify({ text: "An error occurred: " + error.message }).showToast();
      }
    }

    setUsername("");
    setEmail("");
    setMobile("");
    setPassword("");
    setConfirmpass("");
  };

  const getBorderColor = () => {
    if (!confirmpass) return "black";
    return password === confirmpass ? "green" : "red";
  };
  return (
    <div className="main">
      <div className="container">
        <img className="logo" src={logo} alt="" />
        <img className="image" src={image} alt="" />
      </div>
      <div className="maincontainer">
        <img className="logos1" src={logo} alt="" />

        <div className="top">
          <Link to="/Signup">
            <button className="signupbtn">Signup</button>
          </Link>
          <Link to="/Login">
            <button className="loginbtn">Login</button>
          </Link>
        </div>
        <div className="divcont">
          <h3 className="joinus">Join us Today!</h3>
          <form className="formcontainer" onSubmit={submitHandler}>
            <input
              className="emailinput"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Name"
              minLength={3}
            />
            <input
              className="emailinput"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Id."
              minLength={6}
            />
            <input
              type="text"
              className="emailinput"
              placeholder="Mobile No."
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
              }}
            />
            <input
              className="passinput"
              style={{ borderColor: getBorderColor() }}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // validatePasswords();
              }}
              required
              placeholder="Password"
              minLength={6}
            />

            <input
              className="passinput"
              style={{ borderColor: getBorderColor() }}
              type="password"
              value={confirmpass}
              onChange={(e) => {
                setConfirmpass(e.target.value);
                // validatePasswords();
              }}
              required
              placeholder="Confirm Password"
              minLength={6}
            />
            {error && (
              <p style={{ color: "red", fontSize: "14px", margin: "0px" }}>
                {error}
              </p>
            )}
            <button className="register" type="submit">
              Register
            </button>
            <p className="signup">
              Already have an account?
              <Link to="/Login" className="signupline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
