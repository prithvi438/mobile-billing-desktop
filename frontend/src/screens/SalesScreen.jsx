import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiRefreshCw, FiPlus, FiSearch, FiEdit2, FiEye, FiTrash2, FiCalendar, FiDollarSign, FiFilter, FiChevronRight
} from "react-icons/fi";
import { API_BASE_URL } from "../constants.js";
import ConfirmDialogBox from "../components/ConfirmDialogBox";

const BRAND = {
  primary: "#0B3A6F",
  accent: "#F57C00",
  bg: "#F8FAFC",
  glass: "rgba(255, 255, 255, 0.75)",
  border: "rgba(226, 232, 240, 0.8)",
  text: "#334155",
  textMuted: "#94A3B8"
};

const SalesScreen = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => { fetchSales(true); }, []);

  const fetchSales = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const res = await axios.get(`${API_BASE_URL}/voucher/sales`, {
        params: { page: currentPage, limit, search, paymentMode, fromDate, toDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data.data;
      if (reset) {
        setSales(payload.data);
        setPage(2);
      } else {
        setSales((prev) => [...prev, ...payload.data]);
        setPage(currentPage + 1);
      }
      setTotalPages(payload.meta.totalPages);
    } catch (err) {
      console.error("Sales fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

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
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px"
    },
    title: {
      margin: 0,
      fontSize: "26px",
      fontWeight: 800,
      color: BRAND.primary,
      letterSpacing: "-0.5px"
    },
    subtitle: {
      margin: "4px 0 0",
      color: BRAND.textMuted,
      fontSize: "14px",
      fontWeight: 500
    },
    filterPanel: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
      background: BRAND.glass,
      backdropFilter: "blur(12px)",
      padding: "14px 24px",
      borderRadius: "16px",
      marginBottom: "24px",
      border: `1px solid ${BRAND.border}`,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    },
    searchContainer: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      width: "100%",
      fontWeight: 500,
      color: BRAND.text,
      fontSize: "14px"
    },
    verticalDivider: { width: "1px", height: "24px", background: "#E2E8F0" },
    selectInput: {
      border: "none",
      background: "transparent",
      fontWeight: 600,
      color: BRAND.primary,
      outline: "none",
      cursor: 'pointer',
      fontSize: "14px"
    },
    dateField: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 12px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.5)"
    },
    rawDateInput: {
      border: "none",
      outline: "none",
      fontSize: "13px",
      fontWeight: 500,
      color: BRAND.text,
      background: "transparent"
    },
    applyBtn: {
      background: BRAND.primary,
      color: "#fff",
      border: "none",
      padding: "10px 24px",
      borderRadius: "10px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "0.2s ease"
    },
    tableCard: {
      background: "#fff",
      borderRadius: "20px",
      overflow: "hidden",
      border: `1px solid ${BRAND.border}`,
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
    },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#F8FAFC" },
    th: {
      padding: "16px 24px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: 700,
      color: BRAND.textMuted,
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      borderBottom: `1px solid ${BRAND.border}`
    },
    td: {
      padding: "16px 24px",
      borderTop: `1px solid ${BRAND.border}`,
      fontSize: "14px",
      fontWeight: 500,
      color: BRAND.text
    },
    tdBold: {
      padding: "16px 24px",
      borderTop: `1px solid ${BRAND.border}`,
      fontSize: "14px",
      fontWeight: 700,
      color: BRAND.primary
    },
    miniAvatar: {
      width: "32px",
      height: "32px",
      borderRadius: "10px",
      background: `${BRAND.primary}08`,
      color: BRAND.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: "11px",
      fontWeight: 700,
      border: `1px solid ${BRAND.primary}15`
    },
    primaryBtn: {
      background: BRAND.primary,
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${BRAND.primary}20`
    },
    secondaryBtn: {
      background: "#fff",
      color: BRAND.primary,
      border: `1px solid ${BRAND.border}`,
      padding: "10px 18px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 600,
      cursor: "pointer"
    },
    paymentPill: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      background: "#F1F5F9",
      color: "#475569",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "11px",
      fontWeight: 600
    },
    statusBadge: (isPaid) => ({
      padding: "4px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
      background: isPaid ? "#ECFDF5" : "#FFF7ED",
      color: isPaid ? "#10B981" : BRAND.accent
    }),
    actionBtn: {
      border: "none",
      background: "transparent",
      color: BRAND.textMuted,
      padding: "8px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: '0.2s',
      display: 'flex',
      alignItems: 'center'
    },
    deleteBtn: {
      border: "none",
      background: "transparent",
      color: "#FDA4AF",
      padding: "8px",
      borderRadius: "8px",
      cursor: "pointer",
      display: 'flex',
      alignItems: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Sales Records<span style={{ color: BRAND.accent }}>.</span></h2>
          <p style={styles.subtitle}>Overview of all transaction history</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button style={styles.secondaryBtn} onClick={() => fetchSales(true)}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button style={styles.primaryBtn} onClick={() => navigate("/landing/sales/create-sales")}>
            <FiPlus size={16} /> New Entry
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div style={styles.filterPanel}>
        <div style={styles.searchContainer}>
          <FiSearch size={18} color={BRAND.textMuted} />
          <input
            placeholder="Search invoice or customer..."
            style={styles.searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.verticalDivider} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <FiFilter size={14} color={BRAND.textMuted} />
          <select style={styles.selectInput} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>

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

        <button style={styles.applyBtn} onClick={() => fetchSales(true)}>Apply</button>
      </div>

      {/* DATA TABLE */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Invoice</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Payment</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const isPaid = sale.balanceAmount <= 0;
              return (
                <tr key={sale._id}>
                  <td style={styles.tdBold}>#{sale.voucher?.voucherNo}</td>
                  <td style={styles.td}>{formatDate(sale.voucher?.date)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={styles.miniAvatar}>{sale.customer?.name?.[0] || "W"}</div>
                      <span style={{fontWeight: 600}}>{sale.customer?.name || "Walk-in"}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.paymentPill}>
                      {sale.paymentMode}
                    </span>
                  </td>
                  <td style={styles.tdBold}>
                    ₹{sale.grandTotal?.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(isPaid)}>
                      {isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button style={styles.actionBtn} onClick={() => navigate("/landing/sales-details", { state: { sale } })} title="View"><FiEye size={18} /></button>
                      <button style={styles.actionBtn} onClick={() => navigate("/landing/sales/edit-sales", { state: { sale } })} title="Edit"><FiEdit2 size={16} /></button>
                      <button style={styles.deleteBtn} onClick={() => { setSelectedSaleId(sale._id); setShowConfirm(true); }}><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && <div style={{padding: 24, textAlign: 'center', color: BRAND.textMuted}}>Loading records...</div>}

        {!loading && page <= totalPages && (
          <div style={{ padding: "20px", textAlign: "center", borderTop: `1px solid ${BRAND.border}` }}>
            <button style={{...styles.secondaryBtn, margin: '0 auto'}} onClick={() => fetchSales()}>
              Load More <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      <ConfirmDialogBox
        open={showConfirm}
        title="Delete Sale"
        message="Are you sure you want to delete this sales invoice? This action cannot be undone."
        type="destructive"
        onConfirm={async () => {
          try {
            await axios.delete(`${API_BASE_URL}/voucher/sales/${selectedSaleId}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowConfirm(false); fetchSales(true);
          } catch (e) { console.error(e); }
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default SalesScreen;