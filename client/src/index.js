import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import ChatState from "./context/appState";
import { CallProvider } from "./context/CallContext"; // ← ADD THIS IMPORT

const token = localStorage.getItem("token");

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ChatState>
        <CallProvider> {/* ← MOVE CallProvider HERE */}
          <ChakraProvider>
            <App token={token} />
            <Outlet />
          </ChakraProvider>
        </CallProvider> {/* ← CLOSING TAG HERE */}
      </ChatState>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();