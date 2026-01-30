import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const { setShowLogin, axios, setToken, navigate, fetchUser } = useAppContext();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const endpoint = state === "login" ? "/api/users/login" : "/api/users/register";
      console.log("Submitting to:", endpoint, "with data:", { name, email, password });
      const { data } = await axios.post(endpoint, {
        name: state === "register" ? name : undefined,
        email,
        password,
      });
      if (data.success) {
        navigate("/");
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`; // Set header immediately
        await fetchUser(); // Fetch user data with the new token
        setShowLogin(false);
        toast.success(`Successfully ${state === "login" ? "logged in" : "registered"}!`);
      } else {
        toast.error(data.message || "An error occurred on the server");
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      toast.error(error.response?.data?.message || error.message || "An unexpected error occurred");
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-[100] flex items-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-blue-500">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-blue-500"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-blue-500"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-blue-500"
            type="password"
            required
          />
        </div>

        {state === "register" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-blue-500 cursor-pointer"
            >
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-blue-500 cursor-pointer"
            >
              click here
            </span>
          </p>
        )}

        <button
          className="bg-blue-500 hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer"
          type="submit"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;