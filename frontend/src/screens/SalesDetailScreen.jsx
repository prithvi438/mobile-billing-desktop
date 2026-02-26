import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload, FiShare2, FiFileText } from "react-icons/fi";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F1F5F9",
    border: "#E2E8F0",
    text: "#1E293B",
    textMuted: "#64748B",
    success: "#10B981"
};

const SalesDetailScreen = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const sale = state?.sale;

    if (!sale) {
        return (
            <div style={styles.centerBox}>
                <p>No sale data found.</p>
                <button style={styles.backBtn} onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div style={styles.container}>
            {/* TOP BAR ACTIONS */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button style={styles.backIconButton} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={styles.title}>Invoice Details</h2>
                        <p style={styles.subtitle}>Viewing voucher #{sale.voucher.voucherNo}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={styles.actionBtn}><FiPrinter /> Print</button>
                    <button style={styles.actionBtn}><FiDownload /> PDF</button>
                    <button style={styles.primaryActionBtn}><FiShare2 /> Share</button>
                </div>
            </div>

            <div style={styles.contentLayout}>
                {/* LEFT COLUMN: INVOICE DETAILS */}
                <div style={{ flex: 2 }}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.sectionTitle}><FiFileText style={{ marginRight: 8 }} /> Items Summary</h3>
                            <span style={styles.itemCountBadge}>{sale.items.length} Items</span>
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>Product Description</th>
                                    <th style={styles.thCenter}>Qty</th>
                                    <th style={styles.thCenter}>Rate</th>
                                    <th style={styles.thCenter}>GST</th>
                                    <th style={styles.thRight}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map((item) => (
                                    <tr key={item._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 700, color: BRAND.text }}>{item.inventory.name}</div>
                                            <div style={{ fontSize: 11, color: BRAND.textMuted }}>SKU: {item.inventory._id.slice(-6).toUpperCase()}</div>
                                        </td>
                                        <td style={styles.tdCenter}>{item.quantity}</td>
                                        <td style={styles.tdCenter}>₹{item.rate}</td>
                                        <td style={styles.tdCenter}>{item.gstRate}%</td>
                                        <td style={styles.tdBoldRight}>₹{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN: SUMMARY & FINANCIALS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* CUSTOMER CARD */}
                    <div style={styles.sideCard}>
                        <h4 style={styles.sideTitle}>Customer Info</h4>
                        <div style={styles.avatarRow}>
                            <div style={styles.avatar}>{sale.customer?.name?.[0] || "W"}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{sale.customer?.name || "Walk-in Customer"}</div>
                                <div style={{ fontSize: 12, color: BRAND.textMuted }}>{sale.customer?.phone || "No contact info"}</div>
                            </div>
                        </div>
                        <div style={styles.divider} />
                        <InfoRow label="Billing Date" value={formatDate(sale.voucher.date)} />
                        <InfoRow label="Payment Mode" value={sale.paymentMode} isBadge />
                    </div>

                    {/* BILLING TOTALS */}
                    <div style={{ ...styles.sideCard, backgroundColor: BRAND.primary, color: '#fff' }}>
                        <h4 style={{ ...styles.sideTitle, color: 'rgba(255,255,255,0.7)' }}>Payment Summary</h4>
                        <div style={styles.amountRow}>
                            <span>Sub Total</span>
                            <span>₹{sale.subTotal}</span>
                        </div>
                        <div style={styles.amountRow}>
                            <span>Tax (GST)</span>
                            <span>₹{sale.gstTotal}</span>
                        </div>
                        <div style={styles.dividerLight} />
                        <div style={styles.grandTotalRow}>
                            <span>Grand Total</span>
                            <span>₹{sale.grandTotal.toLocaleString()}</span>
                        </div>
                        <div style={styles.amountRow}>
                            <span style={{ opacity: 0.8 }}>Received</span>
                            <span>₹{sale.receivedAmount}</span>
                        </div>
                        {sale.balanceAmount > 0 && (
                            <div style={styles.balanceBadge}>
                                Pending Balance: ₹{sale.balanceAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* REUSABLE MINI COMPONENTS */
const InfoRow = ({ label, value, isBadge }) => (
    <div style={styles.infoRow}>
        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>{label}</span>
        {isBadge ? (
            <span style={styles.paymentBadge}>{value}</span>
        ) : (
            <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
        )}
    </div>
);

/* ---------------- STYLES ---------------- */

const styles = {
    container: {
        padding: "32px",
        background: BRAND.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
    },
    backIconButton: {
        width: 40, height: 40, borderRadius: 12, border: 'none', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: BRAND.primary
    },
    title: { margin: 0, fontSize: 24, fontWeight: 800, color: BRAND.primary, letterSpacing: '-0.5px' },
    subtitle: { margin: 0, fontSize: 13, color: BRAND.textMuted, fontWeight: 500 },

    actionBtn: {
        padding: '10px 18px', borderRadius: 12, border: `1px solid ${BRAND.border}`,
        background: '#fff', color: BRAND.text, fontWeight: 600, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
    },
    primaryActionBtn: {
        padding: '10px 20px', borderRadius: 12, border: 'none',
        background: BRAND.primary, color: '#fff', fontWeight: 600, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        boxShadow: `0 4px 12px ${BRAND.primary}30`
    },

    contentLayout: { display: 'flex', gap: 24, alignItems: 'flex-start' },

    card: {
        background: "#fff", borderRadius: 20, padding: 0,
        boxShadow: "0 10px 25px rgba(0,0,0,0.02)", overflow: 'hidden',
        border: `1px solid ${BRAND.border}`
    },
    cardHeader: {
        padding: '20px 24px', borderBottom: `1px solid ${BRAND.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    itemCountBadge: {
        background: BRAND.bg, color: BRAND.primary, padding: '4px 12px',
        borderRadius: 8, fontSize: 12, fontWeight: 700
    },

    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#F8FAFC" },
    th: { padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '1px' },
    thCenter: { padding: "14px 12px", textAlign: "center", fontSize: 11, fontWeight: 800, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '1px' },
    thRight: { padding: "14px 24px", textAlign: "right", fontSize: 11, fontWeight: 800, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '1px' },

    tr: { borderBottom: `1px solid ${BRAND.bg}` },
    td: { padding: "18px 24px", fontSize: 14 },
    tdCenter: { padding: "18px 12px", fontSize: 14, textAlign: 'center', fontWeight: 500 },
    tdBoldRight: { padding: "18px 24px", fontSize: 15, fontWeight: 800, textAlign: 'right', color: BRAND.primary },

    sideCard: {
        background: "#fff", borderRadius: 20, padding: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}`
    },
    sideTitle: { margin: '0 0 16px 0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', color: BRAND.textMuted },
    avatarRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    avatar: {
        width: 44, height: 44, borderRadius: 12, background: BRAND.primary,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18
    },
    divider: { height: 1, background: BRAND.border, margin: '16px 0' },
    dividerLight: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' },

    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    paymentBadge: { background: '#EFF6FF', color: BRAND.primary, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 },

    amountRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, fontWeight: 500 },
    grandTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, marginBottom: 16 },
    balanceBadge: {
        background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px',
        borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, marginTop: 10
    },
    centerBox: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: BRAND.textMuted }
};

export default SalesDetailScreen;