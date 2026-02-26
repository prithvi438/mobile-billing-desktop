import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload, FiShare2, FiFileText, FiTruck } from "react-icons/fi";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F1F5F9",
    border: "#E2E8F0",
    text: "#1E293B",
    textMuted: "#64748B",
    success: "#10B981"
};

const PurchaseDetailScreen = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Extracting purchase data from navigation state
    const purchase = state?.purchase || state?.sale; // checking both to be safe

    if (!purchase) {
        return (
            <div style={styles.centerBox}>
                <p>No purchase data found.</p>
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
                        <h2 style={styles.title}>Purchase Details</h2>
                        <p style={styles.subtitle}>Viewing voucher #{purchase.voucher.voucherNo}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={styles.actionBtn} onClick={() => window.print()}><FiPrinter /> Print</button>
                    <button style={styles.actionBtn}><FiDownload /> PDF</button>
                    <button style={styles.primaryActionBtn}><FiShare2 /> Share</button>
                </div>
            </div>

            <div style={styles.contentLayout}>
                {/* LEFT COLUMN: PURCHASE DETAILS */}
                <div style={{ flex: 2 }}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.sectionTitle}><FiFileText style={{ marginRight: 8 }} /> Items Summary</h3>
                            <span style={styles.itemCountBadge}>{purchase.items.length} Items</span>
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>Product Description</th>
                                    <th style={styles.thCenter}>Qty</th>
                                    <th style={styles.thCenter}>Rate</th>
                                    <th style={styles.thRight}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.items.map((item) => (
                                    <tr key={item._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 700, color: BRAND.text }}>{item.inventory.name}</div>
                                            <div style={{ fontSize: 11, color: BRAND.textMuted }}>SKU: {item.inventory.sku || "N/A"}</div>
                                        </td>
                                        <td style={styles.tdCenter}>{item.quantity}</td>
                                        <td style={styles.tdCenter}>₹{item.rate.toLocaleString()}</td>
                                        <td style={styles.tdBoldRight}>₹{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {purchase.voucher.narration && (
                        <div style={{ ...styles.card, marginTop: 24, padding: '20px 24px' }}>
                            <h4 style={styles.sideTitle}>Voucher Narration</h4>
                            <p style={{ margin: 0, fontSize: 14, color: BRAND.text }}>{purchase.voucher.narration}</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: SUPPLIER & FINANCIALS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* SUPPLIER CARD */}
                    <div style={styles.sideCard}>
                        <h4 style={styles.sideTitle}>Supplier Info</h4>
                        <div style={styles.avatarRow}>
                            <div style={styles.avatar}>{purchase.vendor?.name?.[0] || purchase.supplierName?.[0] || "S"}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{purchase.vendor?.name || purchase.supplierName}</div>
                                <div style={{ fontSize: 12, color: BRAND.textMuted }}>{purchase.vendor?.phone || "Contact not provided"}</div>
                            </div>
                        </div>
                        <div style={styles.divider} />
                        <InfoRow label="Entry Date" value={formatDate(purchase.voucher.date)} />
                        <InfoRow label="Business ID" value={purchase.business.slice(-6).toUpperCase()} />
                    </div>

                    {/* PURCHASE TOTALS */}
                    <div style={{ ...styles.sideCard, backgroundColor: BRAND.primary, color: '#fff' }}>
                        <h4 style={{ ...styles.sideTitle, color: 'rgba(255,255,255,0.7)' }}>Financial Summary</h4>
                        <div style={styles.amountRow}>
                            <span>Sub Total</span>
                            <span>₹{purchase.totalAmount.toLocaleString()}</span>
                        </div>
                        <div style={styles.amountRow}>
                            <span>Taxes</span>
                            <span>₹0.00</span>
                        </div>
                        <div style={styles.dividerLight} />
                        <div style={styles.grandTotalRow}>
                            <span>Grand Total</span>
                            <span>₹{purchase.totalAmount.toLocaleString()}</span>
                        </div>
                        
                        <div style={styles.paymentBadgeRow}>
                            <FiTruck size={14} /> 
                            <span>Stock Inflow Recorded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* REUSABLE MINI COMPONENTS */
const InfoRow = ({ label, value }) => (
    <div style={styles.infoRow}>
        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>{label}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
);

/* ---------------- STYLES ---------------- */

const styles = {
    container: { padding: "32px", background: BRAND.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
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
    amountRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, fontWeight: 500 },
    grandTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, marginBottom: 16 },
    paymentBadgeRow: {
        background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px',
        borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 12, marginTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    centerBox: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: BRAND.textMuted },
    backBtn: { padding: '10px 20px', borderRadius: 10, background: BRAND.primary, color: '#fff', border: 'none', cursor: 'pointer' }
};

export default PurchaseDetailScreen;