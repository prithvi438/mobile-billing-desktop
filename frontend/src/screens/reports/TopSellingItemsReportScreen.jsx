import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FiArrowLeft, FiCalendar, FiDownload, 
    FiTrendingUp, FiPackage, FiBarChart2 
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#334155",
    textMuted: "#94A3B8",
    success: "#10B981"
};

const TopSellingItemsReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    
    /* ================= CONTROL REFS ================= */
    const pagination = useRef({
        page: 1,
        isFetching: false,
        hasNextPage: true,
        limit: 100 // Updated to match your curl example for better performance
    });

    /* ================= STATE ================= */
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(today);

    /* ================= API CALL ================= */

    const fetchTopSelling = useCallback(async (reset = false) => {
        // Strict guarding
        if (pagination.current.isFetching) return;
        if (!reset && !pagination.current.hasNextPage) return;

        pagination.current.isFetching = true;
        setLoading(true);

        const targetPage = reset ? 1 : pagination.current.page;

        try {
            const res = await axios.get(`${API_BASE_URL}/reports/top-selling-items`, {
                params: { 
                    fromDate, 
                    toDate, 
                    limit: pagination.current.limit, 
                    page: targetPage 
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const fetchedData = res.data.data || [];
                
                setItems(prev => {
                    if (reset) return fetchedData;
                    
                    // PREVENT REPETITION: Filter out any items already in the list by ID
                    const existingIds = new Set(prev.map(i => i._id));
                    const uniqueNewItems = fetchedData.filter(i => !existingIds.has(i._id));
                    
                    return [...prev, ...uniqueNewItems];
                });
                
                // If we got fewer than the limit, we definitely reached the end
                pagination.current.hasNextPage = fetchedData.length === pagination.current.limit;
                
                // Only increment if we actually fetched something and have a next page
                if (pagination.current.hasNextPage) {
                    pagination.current.page = targetPage + 1;
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            
            // Give the browser time to render before allowing another fetch
            setTimeout(() => {
                pagination.current.isFetching = false;
            }, 500); 
        }
    }, [fromDate, toDate, token]);

    useEffect(() => {
        setInitialLoading(true);
        fetchTopSelling(true);
    }, [fromDate, toDate, fetchTopSelling]); 

    /* ================= SCROLL LOGIC ================= */

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        // Use a 200px buffer to trigger before the user actually hits the very bottom
        const isNearBottom = scrollHeight - scrollTop <= clientHeight + 200;
        
        if (isNearBottom && !loading && pagination.current.hasNextPage) {
            fetchTopSelling(false);
        }
    };

    /* ================= EXPORT ================= */
    const handleExport = () => {
        const headers = ["Rank", "Item Name", "Unit", "Qty Sold", "Sales Amount"];
        const rows = items.map((item, index) => [
            index + 1,
            `"${item.name}"`,
            item.unit,
            item.totalQuantitySold,
            item.totalSalesAmount
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Top_Selling_${fromDate}_to_${toDate}.csv`;
        link.click();
    };

    /* ---------------- STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexShrink: 0 },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
        filterBar: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", padding: "14px 24px", borderRadius: "20px", marginBottom: "24px", border: `1px solid ${BRAND.border}`, flexShrink: 0 },
        dateInput: { border: "none", background: "#F1F5F9", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: BRAND.text, outline: "none" },
        listWrapper: { flex: 1, overflowY: "auto", paddingRight: "8px" },
        card: { background: "#fff", padding: "20px 24px", borderRadius: "20px", border: `1px solid ${BRAND.border}`, marginBottom: "12px", display: "flex", alignItems: "center", transition: "0.2s" },
        rankBox: (index) => ({ width: "40px", height: "40px", borderRadius: "10px", background: index < 3 ? `${BRAND.accent}15` : BRAND.bg, color: index < 3 ? BRAND.accent : BRAND.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", marginRight: "20px" }),
        exportBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary }}>Top Selling Items</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: BRAND.textMuted }}>Items contributing most to your revenue</p>
                    </div>
                </div>
                <button style={styles.exportBtn} onClick={handleExport}><FiDownload /> Export CSV</button>
            </div>

            <div style={styles.filterBar}>
                <FiCalendar color={BRAND.textMuted} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: BRAND.textMuted }}>FROM:</span>
                <input type="date" style={styles.dateInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: BRAND.textMuted }}>TO:</span>
                <input type="date" style={styles.dateInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", color: BRAND.textMuted, fontSize: "13px", fontWeight: 600 }}>
                    <FiBarChart2 /> List Size: {pagination.current.limit}
                </div>
            </div>

            <div style={styles.listWrapper} onScroll={handleScroll}>
                {initialLoading ? (
                    <div style={{ textAlign: "center", padding: "50px", color: BRAND.textMuted }}>Analyzing sales data...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px", color: BRAND.textMuted }}>No sales data found for the selected period.</div>
                ) : (
                    <>
                        {items.map((item, index) => (
                            <div key={`${item._id}-${index}`} style={styles.card}>
                                <div style={styles.rankBox(index)}>#{index + 1}</div>
                                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px", color: BRAND.primary }}>
                                    <FiPackage size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: BRAND.text, fontSize: "16px" }}>{item.name}</div>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted }}>Unit: {item.unit}</div>
                                </div>
                                <div style={{ textAlign: "right", marginRight: "40px" }}>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted, fontWeight: 600 }}>QUANTITY SOLD</div>
                                    <div style={{ fontWeight: 800, color: BRAND.text, fontSize: "18px" }}>{item.totalQuantitySold}</div>
                                </div>
                                <div style={{ textAlign: "right", minWidth: "120px" }}>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted, fontWeight: 600 }}>TOTAL REVENUE</div>
                                    <div style={{ fontWeight: 900, color: BRAND.success, fontSize: "18px" }}>₹{item.totalSalesAmount.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ textAlign: "center", padding: "20px", color: BRAND.textMuted }}>Loading more...</div>}
                        {!pagination.current.hasNextPage && items.length > 0 && <div style={{ textAlign: "center", padding: "30px", color: BRAND.border, fontSize: "12px" }}>End of Report</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default TopSellingItemsReportScreen;