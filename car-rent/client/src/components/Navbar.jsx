import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { assets, menuLinks } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import {motion, scale} from 'motion/react'

const Navbar = () => {
  const { setShowLogin, user, logout, axios, setIsOwner, isOwner, token } = useAppContext();

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const changeRole = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.post("/api/owner/change-role", null, config);
      if (data.success) {
        setIsOwner(true);
        toast.success(data.message);
        navigate("/owner");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        toast.error("Server is not running. Please start the server at localhost:3000.");
      } else if (error.response && error.response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <motion.div
    initial ={{y: -20, opacity:0}}
    animate={{y:0, opacity:1}}
    transition={{duration:0.5}}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 
      text-gray-600 border-b border-borderColor relative transition-all 
      ${location.pathname === "/" ? "bg-light" : ""}`}
    >
      {/* Logo */}
      <Link to="/">
        <motion.img whileHover={{scale:1.05}} src={assets.logo} alt="logo" className="h-8" />
      </Link>

      {/* Desktop Menu */}
      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16
        max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all
        duration-300 z-50
        ${location.pathname === "/" ? "bg-light" : "bg-white"}
        ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path} onClick={() => setOpen(false)}>
            {link.name}
          </Link>
        ))}

        {/* Search bar (visible on large screens only) */}
        <div className="hidden lg:flex items-center text-sm gap-4 border border-borderColor px-3 rounded-full max-w-56">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="search products"
          />
          <img src={assets.search_icon} alt="search" />
        </div>

        {/* List Cars & Signup */}
        <div className="flex max-sm:flex-col items-start sm:items-center gap-6">
          <button
            onClick={() => (isOwner ? navigate("/owner") : changeRole())}
            className="cursor-pointer"
          >
            {"List cars"} {/* Always show "List cars" */}
          </button>
          <button
            onClick={() => (user ? logout() : setShowLogin(true))}
            className="cursor-pointer px-8 py-2 bg-blue-500 hover:bg-primary-dull
             transition-all text-white rounded-lg"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle Button — ONLY ONE */}
      <button
        className="sm:hidden cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <img
          src={open ? assets.close_icon : assets.menu_icon}
          alt="menu"
          className="h-6"
        />
      </button>
    </motion.div>
  );
};

export default Navbar;