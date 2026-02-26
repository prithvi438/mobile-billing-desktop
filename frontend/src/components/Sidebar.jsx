import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    MdDashboard, MdPointOfSale, MdPeople, MdInventory,
    MdCategory, MdSettings, MdMenu, MdSearch, MdClose, MdGroup, MdAssessment, MdLogout
} from "react-icons/md";
import { FaShoppingCart, FaTruck } from "react-icons/fa";
import ConfirmDialogBox from "./ConfirmDialogBox.jsx";
import logo from "../assets/logo.svg";

const brand = {
    primaryBlue: "#0B3A6F",
    darkBlue: "#082E57",
    accentOrange: "#F57C00",
    glassBorder: "rgba(255, 255, 255, 0.1)",
};

const menuItems = [
    { name: "Dashboard", path: "/landing/dashboard", icon: MdDashboard, section: "Overview" },
    { name: "Sales", path: "/landing/sales", icon: MdPointOfSale, section: "Operations" },
    { name: "Customers", path: "/landing/customers", icon: MdPeople, section: "Operations" },
    { name: "Purchase", path: "/landing/purchase", icon: FaShoppingCart, section: "Operations" },
    { name: "Vendors", path: "/landing/vendors", icon: FaTruck, section: "Operations" },
    { name: "Inventory", path: "/landing/inventory", icon: MdInventory, section: "Inventory" },
    { name: "Categories", path: "/landing/categories", icon: MdCategory, section: "Inventory" },
    { name: "Team", path: "/landing/teams", icon: MdGroup, section: "Management" },
    { name: "Reports", path: "/landing/reports", icon: MdAssessment, section: "Management" },
    { name: "Settings", path: "/landing/settings", icon: MdSettings, section: "System" },
];

export default function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const filteredItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {});

    return (
        <div
            style={{
                width: collapsed ? 90 : 270,
                height: "100vh",
                background: `radial-gradient(circle at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 50%), 
                             linear-gradient(180deg, ${brand.primaryBlue} 0%, ${brand.darkBlue} 100%)`,
                color: "#F8FAFC",
                display: "flex",
                flexDirection: "column",
                padding: collapsed ? "20px 8px" : "24px 14px",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRight: `1px solid ${brand.glassBorder}`,
                position: "relative",
            }}
        >
            {/* Header: Logo Integration */}
            <div style={{
                display: "flex",
                flexDirection: collapsed ? "column" : "row",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start", // Better alignment for expanded
                marginBottom: 36,
                gap: collapsed ? 12 : 16,
                paddingLeft: collapsed ? 0 : 4 // Aligns with icons below
            }}>
                <div style={{
                    minWidth: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#FFFFFF", // White background makes Blue/Orange logo pop
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    padding: 6 // Give the logo some breathing room
                }}>
                    <img
                        src={logo}
                        alt="Daksh Logo"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                </div>

                {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{
                            fontWeight: 800,
                            fontSize: 20,
                            letterSpacing: -0.5,
                            color: "#FFFFFF",
                            lineHeight: 1
                        }}>
                            EasyHai
                        </span>
                        <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: brand.accentOrange,
                            textTransform: 'uppercase',
                            marginTop: 4,
                            letterSpacing: 1
                        }}>
                            Everything Easy
                        </span>
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        marginLeft: collapsed ? 0 : "auto",
                        background: "rgba(255,255,255,0.08)",
                        border: `1px solid ${brand.glassBorder}`,
                        color: "#fff",
                        cursor: "pointer",
                        borderRadius: 10,
                        padding: 8,
                        display: "flex",
                        alignItems: "center",
                        backdropFilter: "blur(4px)",
                        transition: "0.3s"
                    }}
                >
                    {collapsed ? <MdMenu size={22} /> : <MdClose size={22} />}
                </button>
            </div>

            {/* Search */}
            {!collapsed && (
                <div style={{
                    position: "relative", marginBottom: 28,
                    background: "rgba(255,255,255,0.04)", borderRadius: 14,
                    border: `1px solid ${brand.glassBorder}`, padding: "10px 14px",
                    display: "flex", alignItems: "center", backdropFilter: "blur(10px)"
                }}>
                    <MdSearch size={20} color="rgba(255,255,255,0.4)" />
                    <input
                        placeholder="Quick Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: "transparent", border: "none", outline: "none",
                            color: "#fff", marginLeft: 10, fontSize: 14, width: "100%"
                        }}
                    />
                </div>
            )}

            {/* Menu Sections */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                {Object.keys(groupedItems).map((section) => (
                    <div key={section} style={{ marginBottom: collapsed ? 12 : 26 }}>
                        {!collapsed && (
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)",
                                textTransform: "uppercase", letterSpacing: 2,
                                marginBottom: 12, paddingLeft: 14
                            }}>
                                {section}
                            </div>
                        )}
                        {groupedItems[section].map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        display: "flex",
                                        flexDirection: collapsed ? "column" : "row",
                                        alignItems: "center",
                                        padding: collapsed ? "12px 4px" : "12px 14px",
                                        borderRadius: 14,
                                        marginBottom: 6,
                                        textDecoration: "none",
                                        transition: "all 0.3s ease",
                                        background: isActive
                                            ? `linear-gradient(135deg, ${brand.accentOrange} 0%, #FF9800 100%)`
                                            : "transparent",
                                        color: "#FFFFFF",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        boxShadow: isActive ? `0 8px 20px rgba(245, 124, 0, 0.3)` : "none",
                                        border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                                    }}
                                >
                                    <Icon size={collapsed ? 24 : 22} style={{
                                        minWidth: collapsed ? "auto" : 22,
                                        filter: isActive ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none"
                                    }} />

                                    <span style={{
                                        marginLeft: collapsed ? 0 : 14,
                                        marginTop: collapsed ? 6 : 0,
                                        fontSize: collapsed ? 10 : 15,
                                        fontWeight: isActive ? 700 : 500,
                                        textAlign: collapsed ? "center" : "left",
                                        opacity: isActive ? 1 : 0.9,
                                        transition: "0.3s"
                                    }}>
                                        {item.name}
                                    </span>

                                    {isActive && !collapsed && (
                                        <div style={{
                                            width: 5, height: 5, borderRadius: "50%",
                                            background: "#fff", marginLeft: "auto",
                                            boxShadow: "0 0 10px #fff"
                                        }} />
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
                <div style={{ marginTop: 10, paddingBottom: 10 }}>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: collapsed ? "column" : "row",
                            alignItems: "center",
                            padding: collapsed ? "12px 4px" : "12px 14px",
                            borderRadius: 14,
                            border: "none",
                            background: "transparent",
                            color: "#FDA4AF", // Slightly reddish to indicate action
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <MdLogout size={collapsed ? 24 : 22} />
                        <span style={{
                            marginLeft: collapsed ? 0 : 14,
                            marginTop: collapsed ? 6 : 0,
                            fontSize: collapsed ? 10 : 15,
                            fontWeight: 600,
                        }}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: "auto",
                paddingTop: 20,
                borderTop: `1px solid ${brand.glassBorder}`,
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
            }}>
                {collapsed ? "©" : `© ${new Date().getFullYear()} EasyHai Premium`}
            </div>
            {/* LOGOUT CONFIRMATION DIALOG */}
            <ConfirmDialogBox
                open={showLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to log out? You will need to login again to access your dashboard."
                type="destructive"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
}