import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);

  // ✅ Axios interceptor to always send token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, []);

  // 🔄 Fetch user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/users/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🚗 Fetch all cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/users/cars");
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        toast.error("Server is not running. Please start the server at localhost:3000.");
      } else {
        toast.error(error.message);
      }
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    toast.success("You have been logged out");
    navigate("/");
  };

  // 👀 Initial fetch
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
    fetchCars();
  }, []);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
