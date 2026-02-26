import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Ensure useNavigate is imported
import axios from "axios";
import { 
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiTruck, FiPhone, 
    FiMail, FiDollarSign, FiActivity, FiBook 
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import ConfirmDialogBox from "../../components/ConfirmDialogBox.jsx";
import InformationDialogBox from "../../components/InformationDialogBox.jsx";
import AddEditVendorModal from "../../components/vendor/AddEditVendorModal.jsx";

const LIMIT = 20;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8",
    success: "#10B981",
    danger: "#EF4444"
};

const VendorScreen = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [vendors, setVendors] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState({ open: false, vendor: null });
    const [confirm, setConfirm] = useState({ open: false, vendorId: null });
    const [info, setInfo] = useState({ open: false, title: "", message: "", type: "info" });

    const token = localStorage.getItem("accessToken");

    const fetchVendors = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const res = await axios.get(`${API_BASE_URL}/vendor`, {
                params: { page: currentPage, limit: LIMIT, search },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                const payload = res.data.data.data;
                if (reset) {
                    setVendors(payload);
                    setPage(2);
                } else {
                    setVendors((prev) => [...prev, ...payload]);
                    setPage(currentPage + 1);
                }
            }
        } catch (err) {
            console.error("Vendor fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, token]);

    useEffect(() => {
        fetchVendors(true);
    }, []);

    const handleDeleteVendor = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/vendor/${confirm.vendorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfirm({ open: false, vendorId: null });
            setInfo({ open: true, title: "Success", message: "Vendor deleted successfully", type: "success" });
            fetchVendors(true);
        } catch (err) {
            setInfo({ open: true, title: "Error", message: "Failed to delete vendor", type: "error" });
        }
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
        title: { margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary },
        filterPanel: { display: "flex", alignItems: "center", gap: "20px", background: BRAND.glass, backdropFilter: "blur(12px)", padding: "14px 24px", borderRadius: "16px", marginBottom: "24px", border: `1px solid ${BRAND.border}` },
        searchContainer: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
        searchInput: { border: "none", background: "transparent", outline: "none", width: "100%", fontWeight: 500, color: BRAND.text },
        tableCard: { background: "#fff", borderRadius: "20px", overflow: "hidden", border: `1px solid ${BRAND.border}` },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: BRAND.textMuted, textTransform: "uppercase", background: "#F8FAFC", borderBottom: `1px solid ${BRAND.border}` },
        td: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", color: BRAND.text },
        avatar: { width: "40px", height: "40px", borderRadius: "12px", background: `${BRAND.primary}10`, color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
        primaryBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, cursor: "pointer" },
        actionBtn: { border: "none", background: "transparent", color: BRAND.textMuted, padding: "8px", cursor: "pointer", transition: "0.2s" },
        statusBadge: (active) => ({
            padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
            background: active ? "#ECFDF5" : "#FFF1F2",
            color: active ? BRAND.success : BRAND.danger,
            display: "inline-flex", alignItems: "center", gap: "5px"
        }),
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Suppliers & Vendors<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={{ color: BRAND.textMuted, margin: "4px 0 0", fontSize: "14px" }}>Manage procurement partners and credit balances</p>
                </div>
                <button style={styles.primaryBtn} onClick={() => setModal({ open: true, vendor: null })}>
                    <FiPlus /> Add Vendor
                </button>
            </div>

            <div style={styles.filterPanel}>
                <div style={styles.searchContainer}>
                    <FiSearch size={18} color={BRAND.textMuted} />
                    <input 
                        placeholder="Search company name or phone..." 
                        style={styles.searchInput} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button style={{ ...styles.primaryBtn, background: BRAND.accent }} onClick={() => fetchVendors(true)}>Apply</button>
            </div>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Vendor Details</th>
                            <th style={styles.th}>Contact Info</th>
                            <th style={styles.th}>Opening Balance</th>
                            <th style={styles.th}>Status</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((v) => (
                            <tr key={v._id}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={styles.avatar}><FiTruck /></div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: BRAND.primary }}>{v.name}</div>
                                            <div style={{ fontSize: 11, color: BRAND.textMuted }}>ID: {v._id.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FiPhone size={12} color={BRAND.textMuted} /> {v.phone}
                                        </span>
                                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FiMail size={12} color={BRAND.textMuted} /> {v.email || "N/A"}
                                        </span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 700, color: BRAND.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiDollarSign size={14} color={BRAND.textMuted} />
                                        {(v.openingBalance || 0).toLocaleString('en-IN')}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.statusBadge(v.isActive)}>
                                        <FiActivity size={10} /> {v.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                        {/* NEW: VIEW TRANSACTIONS BUTTON */}
                                        <button 
                                            style={styles.actionBtn} 
                                            title="View Ledger" 
                                            onClick={() => navigate(`/landing/vendors/${v._id}/transactions`)}
                                        >
                                            <FiBook size={16} color={BRAND.primary} />
                                        </button>

                                        <button style={styles.actionBtn} title="Edit" onClick={() => setModal({ open: true, vendor: v })}>
                                            <FiEdit2 size={16} />
                                        </button>
                                        
                                        <button 
                                            style={{ ...styles.actionBtn, color: '#FDA4AF' }} 
                                            title="Delete"
                                            onClick={() => setConfirm({ open: true, vendorId: v._id })}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading vendors...</div>}
                {!loading && vendors.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: BRAND.textMuted }}>No vendors found.</div>}
            </div>

            <AddEditVendorModal 
                open={modal.open} 
                vendor={modal.vendor} 
                onClose={() => setModal({ open: false, vendor: null })} 
                onSuccess={() => fetchVendors(true)} 
            />

            <ConfirmDialogBox 
                open={confirm.open} 
                title="Delete Vendor"
                type="destructive"
                message="Are you sure you want to remove this vendor? This action cannot be undone."
                onConfirm={handleDeleteVendor} 
                onCancel={() => setConfirm({ open: false, vendorId: null })} 
            />

            <InformationDialogBox 
                open={info.open} 
                title={info.title} 
                message={info.message} 
                type={info.type} 
                onClose={() => setInfo({ ...info, open: false })} 
            />
        </div>
    );
};

export default VendorScreen;