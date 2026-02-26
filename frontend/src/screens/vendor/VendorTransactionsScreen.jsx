import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiPrinter, FiDownload, FiFileText,
    FiCalendar, FiArrowUpRight, FiArrowDownLeft, FiTruck
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";

const LIMIT = 20;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#334155",
    textMuted: "#94A3B8",
    success: "#10B981",
    danger: "#EF4444",
};

const VendorTransactionsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [vendor, setVendor] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchVouchers = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const res = await axios.get(`${API_BASE_URL}/vendor/${id}/vouchers`, {
                params: { page: currentPage, limit: LIMIT },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const { vendor, vouchers, pagination } = res.data.data;

                if (reset) {
                    setVouchers(vouchers);
                    setPage(2);
                } else {
                    setVouchers((prev) => [...prev, ...vouchers]);
                    setPage(currentPage + 1);
                }

                setVendor(vendor);
                setTotalPages(pagination.totalPages);
            }
        } catch (err) {
            console.error("Error fetching vendor vouchers:", err);
        } finally {
            setLoading(false);
        }
    }, [id, page, token]);

    const handleRowClick = async (voucher) => {
        const type = voucher.voucherType?.toUpperCase();
        const token = localStorage.getItem("accessToken");

        if (type === "PURCHASE") {
            try {
                setLoading(true);

                const res = await axios.get(`${API_BASE_URL}/voucher/purchase/${voucher.referenceId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    navigate(`/landing/purchase-details`, {
                        state: { purchase: res.data.data }
                    });
                }
            } catch (err) {
                console.error("Error fetching purchase details:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchVouchers(true);
    }, []);

    /* ---------- HELPERS ---------- */
    const getVoucherStyle = (type) => {
        const isPurchase = type?.toUpperCase() === "PURCHASE";
        return {
            bg: isPurchase ? "#FFF1F2" : "#ECFDF5",
            color: isPurchase ? BRAND.danger : BRAND.success,
            icon: isPurchase ? <FiArrowUpRight /> : <FiArrowDownLeft />
        };
    };

    return (
        <div style={styles.container}>
            {/* HEADER SECTION */}
            <div style={styles.headerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={styles.title}>Vendor Ledger<span style={{ color: BRAND.accent }}>.</span></h2>
                        <p style={styles.subtitle}>Sourcing and Payment History</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }} className="no-print">
                    <button style={styles.secondaryBtn} onClick={() => window.print()}>
                        <FiPrinter /> Print Ledger
                    </button>
                    <button style={styles.primaryBtn}>
                        <FiDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* VENDOR SUMMARY CARD */}
            {vendor && (
                <div style={styles.summaryCard}>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>VENDOR / SUPPLIER</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiTruck size={18} opacity={0.8} />
                            <span style={styles.summaryValue}>{vendor.name}</span>
                        </div>
                    </div>
                    <div style={styles.summaryDivider} />
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>OUTSTANDING PAYABLE</span>
                        <span style={{ ...styles.summaryValue, color: "#fff" }}>
                            ₹ {vendor.outstandingBalance?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div style={styles.summaryDivider} />
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>PHONE</span>
                        <span style={styles.summaryValue}>{vendor.phone}</span>
                    </div>
                </div>
            )}

            {/* TRANSACTIONS TABLE */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Transaction Type</th>
                            <th style={styles.th}>Voucher No</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Narration</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((v, idx) => {
                            const vStyle = getVoucherStyle(v.voucherType);
                            return (
                                <tr key={v.voucherNo + idx} style={styles.tr} onClick={() => handleRowClick(v)}>
                                    <td style={styles.td}>
                                        <span style={styles.badge(vStyle.bg, vStyle.color)}>
                                            {vStyle.icon} {v.voucherType}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 700, color: BRAND.primary }}>{v.voucherNo}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: BRAND.textMuted }}>
                                            <FiCalendar size={12} />
                                            {new Date(v.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, color: BRAND.textMuted, fontSize: 13, maxWidth: 250 }}>
                                        {v.narration || "Stock Purchase"}
                                    </td>
                                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>
                                        ₹{v.totalAmount?.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {loading && <div style={styles.statusBox}>Fetching supplier ledger...</div>}

                {!loading && page <= totalPages && (
                    <div style={styles.loadMoreBox}>
                        <button style={styles.loadMoreBtn} onClick={() => fetchVouchers()}>
                            Load Previous Vouchers
                        </button>
                    </div>
                )}

                {!loading && vouchers.length === 0 && (
                    <div style={styles.emptyState}>
                        <FiFileText size={48} color={BRAND.border} />
                        <p>No transaction records found for this vendor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorTransactionsScreen;

/* ---------- INLINE STYLES ---------- */

const styles = {
    container: {
        padding: "32px",
        background: BRAND.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.03) 0, transparent 50%)",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    },
    title: { margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary, letterSpacing: "-0.5px" },
    subtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "14px", fontWeight: 500 },
    backBtn: {
        width: "40px", height: "40px", borderRadius: "12px", border: `1px solid ${BRAND.border}`,
        background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
    },
    summaryCard: {
        background: BRAND.primary,
        padding: "24px 32px",
        borderRadius: "20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#fff",
        boxShadow: "0 10px 25px rgba(11, 58, 111, 0.2)",
    },
    summaryItem: { display: "flex", flexDirection: "column", gap: 4 },
    summaryLabel: { fontSize: "11px", fontWeight: 700, opacity: 0.7, letterSpacing: "1.2px" },
    summaryValue: { fontSize: "20px", fontWeight: 800 },
    summaryDivider: { width: "1px", height: "40px", background: "rgba(255,255,255,0.2)" },

    tableWrapper: {
        background: "#fff", borderRadius: "20px", overflow: "hidden", border: `1px solid ${BRAND.border}`,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "18px 24px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: BRAND.textMuted,
        textTransform: "uppercase", letterSpacing: "1px", background: "#F8FAFC", borderBottom: `1px solid ${BRAND.border}`,
    },
    tr: { transition: "0.2s", cursor: "Pointer" },
    td: { padding: "18px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", color: BRAND.text },
    tdBold: { padding: "18px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "15px", fontWeight: 800, color: BRAND.primary },
    badge: (bg, color) => ({
        padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800,
        background: bg, color: color, display: "inline-flex", alignItems: "center", gap: "6px"
    }),
    primaryBtn: {
        background: BRAND.primary, color: "#fff", border: "none", padding: "10px 20px",
        borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"
    },
    secondaryBtn: {
        background: "#fff", color: BRAND.primary, border: `1px solid ${BRAND.border}`,
        padding: "10px 20px", borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
    },
    loadMoreBtn: {
        background: "transparent", color: BRAND.primary, border: `1px solid ${BRAND.primary}`,
        padding: "10px 24px", borderRadius: "12px", fontWeight: 800, cursor: "pointer"
    },
    statusBox: { padding: 32, textAlign: "center", color: BRAND.textMuted },
    loadMoreBox: { padding: 32, textAlign: "center", borderTop: `1px solid ${BRAND.bg}` },
    emptyState: { padding: 60, textAlign: "center", color: BRAND.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }
};