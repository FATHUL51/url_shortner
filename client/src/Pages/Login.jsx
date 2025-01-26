import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import image from "../assets/m_image.svg";
import logo from "../assets/Cuvette MERN Final Evaluation Jan 25.svg";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({});

  const navigate = useNavigate();

  const { user, setUser } = useContext(UserDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    const login = {
      email,
      password,
    };
    try {
      const responce = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
        login
      );
      if (responce.status === 200) {
        const data = responce.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        Toastify({ text: "Login successful" }).showToast();
        navigate("/home");
        //to hide credentials from frontend
        window.location.reload();
      }
    } catch (error) {
      if (error.response) {
        Toastify({
          text: error.response.data.message || "Something went wrong!",
        }).showToast();
      } else if (error.request) {
        // Request made but no response received
        Toastify({
          text: error.request.data.message || "Something went wrong!",
        }).showToast();
      } else {
        // Other errors
        Toastify({ text: `An error occurred: ${error.message}` }).showToast();
      }
    }

    setEmail("");
    setPassword("");
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
          <h3 className="joinus">Login</h3>
          <form
            className="formcontainer"
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <input
              className="emailinput"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="Enter your email"
              minLength={6}
            />
            <input
              className="passinput"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Password"
              minLength={6}
            />
            <button className="register">Log in</button>
            <p className="signup">
              Don't have an account ?
              <Link to="/Signup" className="signupline">
                SignUp
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
