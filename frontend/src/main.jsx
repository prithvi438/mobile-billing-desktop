import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

// ================= CROSS-PLATFORM SAFETY MOCK =================
// This prevents "Cannot read properties of undefined" in Web Browsers
// main.jsx
// main.jsx
if (typeof window.electronAPI === "undefined") {
  window.electronAPI = {
    isDesktop: false,
    onDevicesFound: (callback) => {
      console.log("Mock: Scanner listener started");
      // This is the 'destroy' function React looks for
      return () => {
        console.log("Mock: Scanner listener cleaned up");
      };
    },
    selectDevice: () => Promise.resolve({ success: false, error: "Desktop only" }),
  };
}

if (typeof window.printerAPI === "undefined") {
  window.printerAPI = {
    startScan: () => Promise.resolve(),
    printReceipt: () => Promise.resolve({ success: false }),
    printTest: () => Promise.resolve({ success: false }),
    disconnect: () => Promise.resolve(),
  };
}
// =============================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);