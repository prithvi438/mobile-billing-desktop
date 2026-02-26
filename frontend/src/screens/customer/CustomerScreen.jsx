import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiBook, FiFilter, FiChevronRight, FiUser
} from "react-icons/fi";
import { getCustomers, deleteCustomer } from "../../services/customer.service";
import AddEditCustomerModal from "../../components/customer/AddEditCustomerModal";
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

const CustomerScreen = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, customer: null });
  const [confirm, setConfirm] = useState({ open: false, customerId: null });
  const [info, setInfo] = useState({ open: false, title: "", message: "", type: "info" });

  useEffect(() => {
    fetchCustomers(true);
  }, []);

  const fetchCustomers = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const res = await getCustomers({ page: currentPage, limit: LIMIT, search });
      const payload = res.data.data;

      if (reset) {
        setCustomers(payload.data);
        setPage(2);
      } else {
        setCustomers((prev) => [...prev, ...payload.data]);
        setPage(currentPage + 1);
      }
      setTotalPages(payload.meta.totalPages);
    } catch (err) {
      console.error("Customer fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteCustomer(confirm.customerId);
      if (res?.data?.success === false) {
        setInfo({ open: true, title: "Delete Error", message: res.data.message || "Cannot delete customer.", type: "error" });
      } else {
        setConfirm({ open: false, customerId: null });
        fetchCustomers(true);
      }
    } catch (err) {
      setInfo({ open: true, title: "Delete Error", message: err?.response?.data?.message || "Failed to delete.", type: "error" });
    } finally {
      setConfirm({ open: false, customerId: null });
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
    th: {
      padding: "16px 24px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: 700,
      color: BRAND.textMuted,
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      background: "#F8FAFC",
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
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: `${BRAND.primary}08`,
      color: BRAND.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: "12px",
      fontWeight: 700,
      border: `1px solid ${BRAND.primary}15`
    },
    primaryBtn: {
      background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1e4b8a 100%)`,
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
    statusBadge: (isDue) => ({
      padding: "4px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
      background: isDue ? "#FFF7ED" : "#ECFDF5",
      color: isDue ? BRAND.accent : "#10B981"
    }),
    actionBtn: {
      border: "none",
      background: "transparent",
      color: BRAND.textMuted,
      padding: "8px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: '0.2s',
      display: 'inline-flex',
      alignItems: 'center'
    },
    deleteBtn: {
      border: "none",
      background: "transparent",
      color: "#FDA4AF",
      padding: "8px",
      borderRadius: "8px",
      cursor: "pointer",
      display: 'inline-flex',
      alignItems: 'center'
    },
    loadMoreBox: { padding: "24px", textAlign: "center", borderTop: `1px solid ${BRAND.border}` },
    secondaryBtn: {
      background: "#fff",
      color: BRAND.primary,
      border: `1px solid ${BRAND.border}`,
      padding: "10px 24px",
      borderRadius: "12px",
      fontWeight: 600,
      cursor: "pointer",
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Customers<span style={{ color: BRAND.accent }}>.</span></h2>
          <p style={styles.subtitle}>Manage customer profiles and outstanding balances</p>
        </div>

        <button
          style={styles.primaryBtn}
          onClick={() => setModal({ open: true, customer: null })}
        >
          <FiPlus size={18} /> Add New Customer
        </button>
      </div>

      {/* FILTER PANEL */}
      <div style={styles.filterPanel}>
        <div style={styles.searchContainer}>
          <FiSearch size={18} color={BRAND.textMuted} />
          <input
            placeholder="Search by name, phone or email..."
            style={styles.searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button style={styles.applyBtn} onClick={() => fetchCustomers(true)}>Apply</button>
      </div>

      {/* TABLE SECTION */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer Name</th>
              <th style={styles.th}>Contact Info</th>
              <th style={styles.th}>Balance</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => {
              const isDue = (c.openingBalance ?? 0) > 0;
              return (
                <tr key={c._id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={styles.miniAvatar}>{c.name?.[0] || "U"}</div>
                      <span style={{ fontWeight: 600, color: BRAND.primary }}>{c.name}</span>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.phone || "No Phone"}</div>
                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{c.email || "No Email"}</div>
                  </td>

                  <td style={styles.tdBold}>
                    ₹ {(c.openingBalance ?? 0).toLocaleString()}
                  </td>

                  <td style={styles.td}>
                    <span style={styles.statusBadge(isDue)}>
                      {isDue ? "● Due" : "● Clear"}
                    </span>
                  </td>

                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        style={styles.actionBtn}
                        title="Ledger"
                        onClick={() => navigate(`/landing/customers/${c._id}/transactions`)}
                      >
                        <FiBook size={18} />
                      </button>

                      <button
                        style={styles.actionBtn}
                        title="Edit"
                        onClick={() => setModal({ open: true, customer: c })}
                      >
                        <FiEdit2 size={16} />
                      </button>

                      <button
                        style={styles.deleteBtn}
                        title="Delete"
                        onClick={() => setConfirm({ open: true, customerId: c._id })}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading records...</div>}

        {!loading && page <= totalPages && (
          <div style={styles.loadMoreBox}>
            <button style={styles.secondaryBtn} onClick={() => fetchCustomers()}>
              Load More <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* MODALS & DIALOGS */}
      <AddEditCustomerModal
        open={modal.open}
        customer={modal.customer}
        onClose={() => setModal({ open: false, customer: null })}
        onSuccess={() => fetchCustomers(true)}
      />

      <ConfirmDialogBox
        open={confirm.open}
        title="Delete Customer"
        type="destructive"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onCancel={() => setConfirm({ open: false, customerId: null })}
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

export default CustomerScreen;