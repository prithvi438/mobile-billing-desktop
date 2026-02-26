import React, { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, BarChart, Bar, 
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";
import { MdTrendingUp, MdAccountBalanceWallet, MdCreditCard, MdHistory, MdTimer } from "react-icons/md";
import { API_BASE_URL } from "../constants";

const BRAND = {
    primaryBlue: "#0B3A6F",
    darkBlue: "#082E57",
    accentOrange: "#F57C00",
    glass: "rgba(255, 255, 255, 0.7)",
    border: "rgba(255, 255, 255, 0.4)",
};

const DashboardScreen = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/dashboard`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok || json.success !== true) throw new Error("Failed to load dashboard");
            setDashboard(json.data);
        } catch (err) {
            setError(err.message || "Dashboard API error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    if (loading) return <div style={centerState}>Refining your insights...</div>;
    if (error) return <div style={{ ...centerState, color: BRAND.accentOrange }}>{error}</div>;

    const { summary, paymentSplit, topCategories, last7DaysSales, hourlySales, peakHour } = dashboard;

    return (
        /* Added willChange and scroll-behavior for Electron smoothness */
        <div style={styles.container}>
            {/* HEADER */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: BRAND.darkBlue, margin: 0, letterSpacing: "-1px" }}>
                    Business Overview<span style={{ color: BRAND.accentOrange }}>.</span>
                </h1>
                <p style={{ color: "#64748B", marginTop: 6, fontWeight: 500 }}>Live performance analytics for your store.</p>
            </div>

            {/* TOP STATS */}
            <div style={grid4}>
                <StatCard title="Total Revenue" value={summary.totalSales} icon={<MdTrendingUp />} trend="+12.5%" isPrimary />
                <StatCard title="Cash Sales" value={summary.cashSales} icon={<MdAccountBalanceWallet />} color={BRAND.primaryBlue} />
                <StatCard title="UPI Payments" value={summary.upiSales} icon={<MdCreditCard />} color="#6366F1" />
                <StatCard title="Outstanding" value={summary.outstandingCredit} icon={<MdHistory />} color="#EF4444" />
            </div>

            {/* MAIN CHARTS SECTION */}
            <div style={mainGrid}>
                <Card title="Revenue Trend (7 Days)" span={2}>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={last7DaysSales.map(d => ({ 
                            name: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }), 
                            value: d.value 
                        }))}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BRAND.primaryBlue} stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor={BRAND.primaryBlue} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="value" stroke={BRAND.primaryBlue} strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Payment Channels">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie 
                                data={paymentSplit} 
                                dataKey="value" 
                                nameKey="label" 
                                innerRadius={70} 
                                outerRadius={95} 
                                paddingAngle={8}
                                stroke="none"
                                animationDuration={800} // Reduced for Electron performance
                            >
                                {paymentSplit.map((p, i) => (
                                    <Cell key={i} fill={i === 0 ? BRAND.primaryBlue : i === 1 ? BRAND.accentOrange : "#6366F1"} />
                                ))}
                            </Pie>
                            <Tooltip cornerRadius={12} border="none" />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div style={{ ...mainGrid, marginTop: 24 }}>
                <Card title="Inventory Performance">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topCategories} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: BRAND.darkBlue}} width={100} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                            <Bar dataKey="value" fill={BRAND.darkBlue} radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Hourly Traffic" span={2}>
                    <div style={peakBadge}>
                        <MdTimer size={16} /> 
                        Peak: <span style={{color: BRAND.primaryBlue, marginLeft: 4}}>{peakHour.hour} (Avg ₹{peakHour.value.toLocaleString()})</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={hourlySales}>
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} />
                            <Bar dataKey="value" fill={BRAND.accentOrange} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, icon, color, isPrimary, trend }) => (
    <div style={{
        ...styles.electronOptimize,
        background: isPrimary 
            ? `linear-gradient(135deg, ${BRAND.primaryBlue} 0%, ${BRAND.darkBlue} 100%)` 
            : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)", // Reduced blur radius for Electron stability
        padding: "28px",
        borderRadius: "24px",
        boxShadow: isPrimary 
            ? "0 20px 25px -5px rgba(11, 58, 111, 0.2)" 
            : "0 10px 15px -3px rgba(0,0,0,0.04)",
        border: `1px solid ${BRAND.border}`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
    }}>
        {isPrimary && <div style={shineEffect} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ 
                width: 48, height: 48, borderRadius: 14, 
                background: isPrimary ? "rgba(255,255,255,0.15)" : `${color}10`,
                display: "flex", alignItems: "center", justifyContent: "center", 
                color: isPrimary ? "#fff" : color, fontSize: 24
            }}>{icon}</div>
            {trend && (
                <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "4px 10px", borderRadius: "10px", fontSize: 12, fontWeight: 700 }}>
                    {trend}
                </div>
            )}
        </div>
        <div style={{ marginTop: 24 }}>
            <div style={{ color: isPrimary ? "rgba(255,255,255,0.6)" : "#64748B", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
            <div style={{ color: isPrimary ? "#fff" : BRAND.darkBlue, fontSize: 28, fontWeight: 900, marginTop: 6, letterSpacing: "-0.5px" }}>
                ₹{value.toLocaleString()}
            </div>
        </div>
    </div>
);

const Card = ({ title, children, span = 1 }) => (
    <div style={{
        ...styles.electronOptimize,
        gridColumn: `span ${span}`, 
        background: "rgba(255, 255, 255, 0.7)", 
        backdropFilter: "blur(12px)",
        padding: "30px", 
        borderRadius: "28px",
        border: `1px solid ${BRAND.border}`, 
        display: "flex", 
        flexDirection: "column"
    }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: BRAND.darkBlue, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{width: 4, height: 18, background: BRAND.accentOrange, borderRadius: 4}} />
            {title}
        </h3>
        <div style={{ flex: 1 }}>{children}</div>
    </div>
);

/* ================= STYLES ================= */

const styles = {
    container: {
        padding: "40px", 
        backgroundColor: "#F1F5F9", 
        minHeight: "100vh", 
        backgroundImage: "radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.03) 0, transparent 50%)",
        /* Fixes for Electron Scroll Jitter */
        overflowY: "auto",
        height: "100vh",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
    },
    electronOptimize: {
        /* This forces the element onto its own GPU layer */
        transform: "translateZ(0)",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden"
    }
};

const shineEffect = {
    position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    pointerEvents: "none"
};
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" };
const mainGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" };
const centerState = { display: "flex", height: "80vh", alignItems: "center", justifyContent: "center", fontWeight: 700, color: BRAND.primaryBlue, fontSize: "1.2rem" };
const tooltipStyle = { borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 600, padding: "12px" };
const peakBadge = {
    display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.5)", 
    padding: "8px 16px", borderRadius: "12px", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 20,
    border: `1px solid ${BRAND.border}`
};

export default DashboardScreen;