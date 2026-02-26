import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiRefreshCw, FiPlus, FiSearch, FiEdit2, FiEye, FiTrash2, FiCalendar, FiFilter, FiChevronRight, FiTruck, FiHash
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import ConfirmDialogBox from "../../components/ConfirmDialogBox";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8"
};

const PurchaseScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);

    useEffect(() => { fetchPurchases(true); }, []);

    const fetchPurchases = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            const res = await axios.get(`${API_BASE_URL}/voucher/purchase`, {
                params: { page: currentPage, limit, search, fromDate, toDate },
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = res.data.data;
            if (reset) {
                setPurchases(payload.data);
                setPage(2);
            } else {
                setPurchases((prev) => [...prev, ...payload.data]);
                setPage(currentPage + 1);
            }
            setTotalPages(payload.meta.totalPages);
        } catch (err) {
            console.error("Purchase fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, fromDate, toDate, token]);

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: {
            padding: "32px",
            background: BRAND.bg,
            minHeight: "100vh",
            backgroundImage: "radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.03) 0, transparent 50%)",
            fontFamily: "'Inter', sans-serif"
        },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
        title: { margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary, letterSpacing: "-0.5px" },
        subtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "14px", fontWeight: 500 },
        filterPanel: {
            display: "flex", alignItems: "center", gap: "24px", background: BRAND.glass, backdropFilter: "blur(12px)",
            padding: "14px 24px", borderRadius: "16px", marginBottom: "24px", border: `1px solid ${BRAND.border}`,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        },
        searchContainer: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
        searchInput: { border: "none", background: "transparent", outline: "none", width: "100%", fontWeight: 500, color: BRAND.text, fontSize: "14px" },
        verticalDivider: { width: "1px", height: "24px", background: "#E2E8F0" },
        dateField: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.5)" },
        rawDateInput: { border: "none", outline: "none", fontSize: "13px", fontWeight: 500, color: BRAND.text, background: "transparent" },
        applyBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", transition: "0.2s ease" },
        tableCard: { background: "#fff", borderRadius: "20px", overflow: "hidden", border: `1px solid ${BRAND.border}`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: {
            padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: BRAND.textMuted,
            textTransform: "uppercase", letterSpacing: "1.2px", borderBottom: `1px solid ${BRAND.border}`, background: "#F8FAFC"
        },
        td: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", fontWeight: 500, color: BRAND.text },
        tdBold: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", fontWeight: 700, color: BRAND.primary },
        miniAvatar: {
            width: "32px", height: "32px", borderRadius: "10px", background: `${BRAND.primary}08`, color: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: "11px", fontWeight: 700, border: `1px solid ${BRAND.primary}15`
        },
        primaryBtn: {
            background: BRAND.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 12px ${BRAND.primary}20`
        },
        secondaryBtn: {
            background: "#fff", color: BRAND.primary, border: `1px solid ${BRAND.border}`, padding: "10px 18px",
            borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, cursor: "pointer"
        },
        actionBtn: { border: "none", background: "transparent", color: BRAND.textMuted, padding: "8px", borderRadius: "8px", cursor: "pointer", display: 'flex' },
        deleteBtn: { border: "none", background: "transparent", color: "#FDA4AF", padding: "8px", borderRadius: "8px", cursor: "pointer", display: 'flex' }
    };

    return (
        <div style={styles.container}>
            {/* HEADER SECTION */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Purchase Records<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={styles.subtitle}>Inventory intake and supplier billing records</p>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button style={styles.secondaryBtn} onClick={() => fetchPurchases(true)}>
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                    <button style={styles.primaryBtn} onClick={() => navigate("/landing/purchase/create-purchase")}>
                        <FiPlus size={16} /> New Purchase
                    </button>
                </div>
            </div>

            {/* FILTER PANEL */}
            <div style={styles.filterPanel}>
                <div style={styles.searchContainer}>
                    <FiSearch size={18} color={BRAND.textMuted} />
                    <input
                        placeholder="Search voucher or vendor..."
                        style={styles.searchInput}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={styles.verticalDivider} />

                <div style={{ display: "flex", gap: 8 }}>
                    <div style={styles.dateField}>
                        <FiCalendar size={14} color={BRAND.textMuted} />
                        <input type="date" style={styles.rawDateInput} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div style={styles.dateField}>
                        <FiCalendar size={14} color={BRAND.textMuted} />
                        <input type="date" style={styles.rawDateInput} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                </div>

                <button style={styles.applyBtn} onClick={() => fetchPurchases(true)}>Apply</button>
            </div>

            {/* DATA TABLE */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Voucher No</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Vendor / Supplier</th>
                            <th style={styles.th}>Items</th>
                            <th style={styles.th}>Total Amount</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {purchases.map((purchase) => (
                            <tr key={purchase._id}>
                                <td style={styles.tdBold}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiHash size={14} color={BRAND.textMuted} />
                                        {purchase.voucher?.voucherNo}
                                    </div>
                                </td>
                                <td style={styles.td}>{formatDate(purchase.voucher?.date)}</td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={styles.miniAvatar}><FiTruck size={14} /></div>
                                        <span style={{ fontWeight: 600 }}>{purchase.vendor?.name || purchase.supplierName}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ color: BRAND.textMuted }}>{purchase.items?.length || 0} Items</span>
                                </td>
                                <td style={styles.tdBold}>₹{purchase.totalAmount?.toLocaleString('en-IN')}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                        <button
                                            style={styles.actionBtn}
                                            onClick={() => navigate("/landing/purchase-details", { state: { purchase } })}
                                            title="View"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                        <button style={styles.actionBtn} title="Edit"><FiEdit2 size={16} /></button>
                                        <button style={styles.deleteBtn} onClick={() => { setSelectedPurchaseId(purchase._id); setShowConfirm(true); }}><FiTrash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading procurement data...</div>}

                {!loading && page <= totalPages && (
                    <div style={{ padding: "20px", textAlign: "center", borderTop: `1px solid ${BRAND.border}` }}>
                        <button style={{ ...styles.secondaryBtn, margin: '0 auto' }} onClick={() => fetchPurchases()}>
                            Load More <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialogBox
                open={showConfirm}
                title="Delete Purchase"
                message="Are you sure you want to delete this purchase voucher? This will revert stock levels. This action cannot be undone."
                type="destructive"
                onConfirm={async () => {
                    try {
                        await axios.delete(`${API_BASE_URL}/voucher/purchase/${selectedPurchaseId}`, { headers: { Authorization: `Bearer ${token}` } });
                        setShowConfirm(false); fetchPurchases(true);
                    } catch (e) { console.error(e); }
                }}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
};

export default PurchaseScreen;