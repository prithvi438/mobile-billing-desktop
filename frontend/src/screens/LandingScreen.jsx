import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { theme } from "../theme/theme.js";

export default function LandingScreen() {
    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                fontFamily: theme.typography.fontFamily,
                background: "#F6F7F9",
                padding: '0px',
                margin: '0px'
            }}
        >
            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: 24,
                    overflowY: "auto",
                }}
            >
                <Outlet /> 
            </div>
        </div>
    );
}
