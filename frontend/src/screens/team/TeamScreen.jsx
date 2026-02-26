import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiShield, FiChevronRight, FiUsers, FiMail, FiPhone
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import AddEditTeamModal from "../../components/team/AddEditTeamModal"; // You'll need to create this
import ConfirmDialogBox from "../../components/ConfirmDialogBox.jsx";
import InformationDialogBox from "../../components/InformationDialogBox.jsx";

const LIMIT = 20;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8"
};

const TeamScreen = () => {
    const [team, setTeam] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState({ open: false, member: null });
    const [confirm, setConfirm] = useState({ open: false, memberId: null });
    const [info, setInfo] = useState({ open: false, title: "", message: "", type: "info" });
    const [isDeleting, setIsDeleting] = useState(false);
    const token = localStorage.getItem("accessToken");

    const fetchTeam = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const res = await axios.get(`${API_BASE_URL}/team`, {
                params: { page: currentPage, limit: LIMIT, search },
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload = res.data.data;

            if (reset) {
                setTeam(payload.data);
                setPage(2);
            } else {
                setTeam((prev) => [...prev, ...payload.data]);
                setPage(currentPage + 1);
            }
            setTotalPages(payload.meta.totalPages);
        } catch (err) {
            console.error("Team fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, token]);

    useEffect(() => {
        fetchTeam(true);
    }, []);

    const handleConfirmDelete = async () => {
        if (!confirm.memberId) return;

        try {
            setIsDeleting(true); // Start loading
            const res = await axios.delete(`${API_BASE_URL}/team/${confirm.memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                setConfirm({ open: false, memberId: null });
                setInfo({
                    open: true,
                    title: "Member Removed",
                    message: "The team member has been deleted successfully.",
                    type: "success"
                });
                fetchTeam(true);
            }
        } catch (err) {
            setConfirm({ open: false, memberId: null });
            setInfo({
                open: true,
                title: "Error",
                message: err?.response?.data?.message || "Failed to remove team member. Please try again.",
                type: "error"
            });
        } finally {
            setIsDeleting(false); // Stop loading
        }
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: {
            padding: "32px",
            background: BRAND.bg,
            minHeight: "100vh",
            backgroundImage: "radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.03) 0, transparent 50%)",
            fontFamily: "'Inter', sans-serif"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px"
        },
        title: { margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary, letterSpacing: "-0.5px" },
        subtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "14px", fontWeight: 500 },

        filterPanel: {
            display: "flex", alignItems: "center", gap: "24px",
            background: BRAND.glass, backdropFilter: "blur(12px)",
            padding: "14px 24px", borderRadius: "16px", marginBottom: "24px",
            border: `1px solid ${BRAND.border}`, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        },
        searchContainer: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
        searchInput: { border: "none", background: "transparent", outline: "none", width: "100%", fontWeight: 500, color: BRAND.text, fontSize: "14px" },
        applyBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" },

        tableCard: {
            background: "#fff", borderRadius: "20px", overflow: "hidden",
            border: `1px solid ${BRAND.border}`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
        },
        table: { width: "100%", borderCollapse: "collapse" },
        th: {
            padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: 700,
            color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1.2px",
            background: "#F8FAFC", borderBottom: `1px solid ${BRAND.border}`
        },
        td: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", fontWeight: 500, color: BRAND.text },

        miniAvatar: {
            width: "36px", height: "36px", borderRadius: "10px",
            background: `${BRAND.primary}08`, color: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, border: `1px solid ${BRAND.primary}15`
        },
        roleBadge: (role) => ({
            padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
            background: role === "OWNER" ? "#EEF2FF" : "#F1F5F9",
            color: role === "OWNER" ? "#4F46E5" : BRAND.text,
            display: "inline-flex", alignItems: "center", gap: "5px"
        }),
        statusBadge: (active) => ({
            padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
            background: active ? "#ECFDF5" : "#FFF1F2",
            color: active ? "#10B981" : "#E11D48",
        }),
        primaryBtn: {
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1e4b8a 100%)`,
            color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "8px", fontWeight: 600,
            cursor: "pointer", boxShadow: `0 4px 12px ${BRAND.primary}20`
        },
        actionBtn: { border: "none", background: "transparent", color: BRAND.textMuted, padding: "8px", borderRadius: "8px", cursor: "pointer" },
        deleteBtn: { border: "none", background: "transparent", color: "#FDA4AF", padding: "8px", borderRadius: "8px", cursor: "pointer" }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Team Members<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={styles.subtitle}>Manage staff access and permissions</p>
                </div>

                <button style={styles.primaryBtn} onClick={() => setModal({ open: true, member: null })}>
                    <FiPlus size={18} /> Add Member
                </button>
            </div>

            {/* FILTER */}
            <div style={styles.filterPanel}>
                <div style={styles.searchContainer}>
                    <FiSearch size={18} color={BRAND.textMuted} />
                    <input
                        placeholder="Search by name, email or username..."
                        style={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button style={styles.applyBtn} onClick={() => fetchTeam(true)}>Apply</button>
            </div>

            {/* TABLE */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Member</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Status</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {team.map((m) => (
                            <tr key={m._id}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={styles.miniAvatar}>{m.name?.[0]?.toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: BRAND.primary }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: BRAND.textMuted }}>@{m.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <FiMail size={12} color={BRAND.textMuted} /> {m.email}
                                        </span>
                                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <FiPhone size={12} color={BRAND.textMuted} /> {m.phone}
                                        </span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.roleBadge(m.role)}>
                                        <FiShield size={10} /> {m.role}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.statusBadge(m.isActive)}>
                                        ● {m.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                        <button style={styles.actionBtn} title="Edit" onClick={() => setModal({ open: true, member: m })}>
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            style={styles.deleteBtn}
                                            title="Delete"
                                            onClick={() => setConfirm({ open: true, memberId: m._id })}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading team...</div>}
                {(loading || isDeleting) && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Processing...</div>}
            </div>

            {/* MODALS */}
            <AddEditTeamModal
                open={modal.open}
                member={modal.member}
                onClose={() => setModal({ open: false, member: null })}
                onSuccess={() => fetchTeam(true)}
            />

            <ConfirmDialogBox
                open={confirm.open}
                title="Remove Member"
                type="destructive"
                loading={isDeleting} // Pass the loading state to the component
                message="Are you sure you want to remove this team member? They will lose all access to this business immediately."
                onCancel={() => setConfirm({ open: false, memberId: null })}
                onConfirm={handleConfirmDelete}
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

export default TeamScreen;