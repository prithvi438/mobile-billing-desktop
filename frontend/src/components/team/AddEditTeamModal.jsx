import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiUser, FiMail, FiPhone, FiLock, FiShield, FiSave, FiInfo } from "react-icons/fi";
import { API_BASE_URL } from "../../constants";
import InformationDialogBox from "../InformationDialogBox.jsx";

const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    danger: "#EF4444"
};

const AddEditTeamModal = ({ open, onClose, member, onSuccess }) => {
    const isEdit = !!member;
    const token = localStorage.getItem("accessToken");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dialog, setDialog] = useState({ open: false, type: "success", title: "", message: "" });

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "STAFF",
        isActive: true
    });

    useEffect(() => {
        if (member && open) {
            setForm({
                name: member.name || "",
                email: member.email || "",
                phone: member.phone || "",
                password: "", // Usually not returned/edited via team patch
                role: member.role || "STAFF",
                isActive: member.isActive ?? true
            });
        } else if (open) {
            setForm({ name: "", email: "", phone: "", password: "", role: "STAFF", isActive: true });
            setError("");
        }
    }, [member, open]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!form.name || !form.email || (!isEdit && !form.password)) {
            setError("Please fill all mandatory fields");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                // PATCH API Logic
                const payload = {
                    name: form.name,
                    role: form.role,
                    isActive: form.isActive
                };
                await axios.patch(`${API_BASE_URL}/team/${member._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // POST API Logic
                await axios.post(`${API_BASE_URL}/team`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            setDialog({
                open: true,
                type: "error",
                title: "Operation Failed",
                message: err.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {` @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } `}
            </style>
            <div style={styles.overlay}>
                <div style={{ ...styles.modal, animation: "modalPop 0.3s ease-out" }}>

                    {/* HEADER */}
                    <div style={styles.header}>
                        <div style={styles.headerTextWrapper}>
                            <div style={styles.iconCircle}>
                                <FiUser size={22} color={BRAND.primary} />
                            </div>
                            <div>
                                <h3 style={styles.title}>{isEdit ? "Update Member" : "Add Team Member"}</h3>
                                <p style={styles.subtitle}>{isEdit ? "Modify access permissions" : "Register new staff credentials"}</p>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}><FiX size={20} /></button>
                    </div>

                    {/* CONTENT */}
                    <div style={styles.content}>
                        <div style={styles.row}>
                            <FormGroup label="Full Name *" style={{ flex: 1 }}>
                                <Field icon={<FiUser />} value={form.name} placeholder="e.g. Rahul Sharma"
                                    onChange={(val) => setForm({ ...form, name: val })} />
                            </FormGroup>
                            <FormGroup label="Role" style={{ flex: 0.6 }}>
                                <select
                                    style={styles.selectInput}
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="STAFF">STAFF</option>
                                    <option value="MANAGER">MANAGER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </FormGroup>
                        </div>

                        <div style={styles.row}>
                            <FormGroup label="Email Address *" style={{ flex: 1.2 }}>
                                <Field icon={<FiMail />} value={form.email} placeholder="rahul@daksh.com" disabled={isEdit}
                                    onChange={(val) => setForm({ ...form, email: val })} />
                            </FormGroup>
                            <FormGroup label="Phone Number" style={{ flex: 1 }}>
                                <Field icon={<FiPhone />} value={form.phone} placeholder="98765..." disabled={isEdit}
                                    onChange={(val) => setForm({ ...form, phone: val })} />
                            </FormGroup>
                        </div>

                        {!isEdit && (
                            <FormGroup label="Login Password *">
                                <Field icon={<FiLock />} value={form.password} type="password" placeholder="••••••••"
                                    onChange={(val) => setForm({ ...form, password: val })} />
                            </FormGroup>
                        )}

                        {isEdit && (
                            <div style={styles.statusToggle}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.text }}>Account Status</div>
                                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>Toggle member's ability to login</div>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    style={styles.toggleBtn(form.isActive)}
                                >
                                    {form.isActive ? "Active" : "Inactive"}
                                </button>
                            </div>
                        )}

                        <div style={styles.infoBox}>
                            <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>Staff members can log in using their email and the password provided above.</span>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div style={styles.footer}>
                        <button style={styles.cancelBtn} onClick={onClose}>Discard</button>
                        <button style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                            <FiSave size={18} /> {loading ? "Saving..." : isEdit ? "Update Profile" : "Create Account"}
                        </button>
                    </div>
                </div>
            </div>

            <InformationDialogBox open={dialog.open} type={dialog.type} title={dialog.title} message={dialog.message} onClose={() => setDialog({ ...dialog, open: false })} />
        </>
    );
};

/* ---------- SUB-COMPONENTS ---------- */

const FormGroup = ({ label, children, style }) => (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
        <label style={styles.labelStyle}>{label}</label>
        {children}
    </div>
);

const Field = ({ icon, type = "text", value, onChange, placeholder, disabled }) => (
    <div style={{ ...styles.fieldWrapper, background: disabled ? "#F1F5F9" : "#F8FAFC" }}>
        <span style={styles.fieldIcon}>{icon}</span>
        <input
            type={type}
            style={styles.fieldInput}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

/* ---------- INLINE STYLES ---------- */

const styles = {
    overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 },
    modal: { width: 560, background: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)", overflow: "hidden" },
    header: { padding: "24px 30px", background: `linear-gradient(135deg, #fff 0%, #F8FAFC 100%)`, borderBottom: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
    headerTextWrapper: { display: "flex", alignItems: "center", gap: 16 },
    iconCircle: { width: 48, height: 48, borderRadius: 14, background: `${BRAND.primary}10`, display: "flex", alignItems: "center", justifyContent: "center" },
    title: { margin: 0, fontSize: "20px", fontWeight: 800, color: BRAND.dark },
    subtitle: { margin: "2px 0 0", fontSize: "13px", color: BRAND.textMuted, fontWeight: 500 },
    closeBtn: { background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 8, display: "flex" },
    content: { padding: "30px", display: "flex", flexDirection: "column", gap: 18 },
    row: { display: "flex", gap: 16 },
    labelStyle: { fontSize: "11px", fontWeight: 700, color: BRAND.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" },
    fieldWrapper: { display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${BRAND.border}`, padding: "12px 16px", borderRadius: "14px" },
    fieldIcon: { color: BRAND.primary, display: "flex", fontSize: "18px" },
    fieldInput: { border: "none", outline: "none", flex: 1, fontSize: "15px", fontWeight: 600, color: BRAND.text, background: "transparent" },
    selectInput: { padding: "12px 16px", borderRadius: "14px", border: `1.5px solid ${BRAND.border}`, background: "#F8FAFC", fontSize: "14px", fontWeight: 700, color: BRAND.primary, outline: "none" },
    statusToggle: { display: "flex", alignItems: "center", padding: "14px 20px", borderRadius: "16px", background: "#F8FAFC", border: `1px solid ${BRAND.border}` },
    toggleBtn: (active) => ({ padding: "8px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "12px", cursor: "pointer", background: active ? "#ECFDF5" : "#FFF1F2", color: active ? "#10B981" : "#E11D48" }),
    infoBox: { padding: "12px 16px", borderRadius: "14px", background: "#F1F5F9", color: BRAND.textMuted, fontSize: "12px", display: "flex", gap: 12, border: "1px solid #E2E8F0" },
    footer: { padding: "20px 30px", background: "#F8FAFC", borderTop: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "flex-end", gap: 12 },
    cancelBtn: { background: "transparent", color: BRAND.textMuted, border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: 600, cursor: "pointer" },
    primaryBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "12px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", boxShadow: `0 8px 16px ${BRAND.primary}30`, display: "flex", alignItems: "center", gap: 10 },
};

export default AddEditTeamModal;