import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch, FiPlus, FiMinus, FiShoppingCart, FiUser,
  FiEye, FiSave, FiX, FiPackage, FiPrinter, FiCheckCircle, FiCreditCard, FiSmartphone, FiDollarSign, FiClock
} from "react-icons/fi";
import InformationDialogBox from "../components/InformationDialogBox";
import { API_BASE_URL } from "../constants.js";
import AddEditCustomerModal from "../components/customer/AddEditCustomerModal.jsx";
import { getCustomers } from "../services/customer.service"; // Import your service

const BRAND = {
  primary: "#0B3A6F",
  accent: "#F57C00",
  bg: "#F8FAFC",
  border: "#CBD5E1",
  white: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B"
};

export default function CreateSalesScreen() {
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  const inventoryScrollRef = useRef(null);
  const customerDropdownRef = useRef(null); // Ref to close dropdown on click outside

  /* ================= STATE ================= */
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([{ _id: "all", name: "All Items" }]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});

  // Customer Selection States
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Payment States
  const [paymentType, setPaymentType] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(0);

  const [narration, setNarration] = useState("");
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "info", title: "", message: "" });
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [printing, setPrinting] = useState(false);

  /* ================= FETCHING LOGIC ================= */

  // Fetch Customers
  const fetchCustomers = useCallback(async (reset = false) => {
    try {
      setCustomerLoading(true);
      const currentPage = reset ? 1 : customerPage;
      const res = await getCustomers({
        page: currentPage,
        limit: 15,
        search: customerSearch,
      });
      const payload = res.data.data;
      setCustomers(prev => reset ? payload.data : [...prev, ...payload.data]);
      setCustomerPage(currentPage + 1);
      setCustomerTotalPages(payload.meta.totalPages);
    } catch (err) {
      console.error("Customer fetch error:", err);
    } finally {
      setCustomerLoading(false);
    }
  }, [customerSearch, customerPage]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/category?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.data) {
        setCategories([{ _id: "all", name: "All Items" }, ...res.data.data.data]);
      }
    } catch (e) { console.error("Category error:", e); }
  }, [token]);

  // Fetch Inventory
  const fetchInventory = useCallback(async (isFirstLoad = false) => {
    if (loading || (!hasMore && !isFirstLoad)) return;
    setLoading(true);
    try {
      const pageToFetch = isFirstLoad ? 1 : page;
      const res = await axios.get(`${API_BASE_URL}/inventory`, {
        params: { page: pageToFetch, limit: 24, search, category: selectedCategory === "all" ? "" : selectedCategory, isActive: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data?.data?.data || [];
      setInventory(prev => isFirstLoad ? newData : [...prev, ...newData]);
      setHasMore(newData.length === 24);
      setPage(pageToFetch + 1);
    } catch (e) { console.error("Inventory error:", e); }
    finally { setLoading(false); }
  }, [token, page, loading, hasMore, search, selectedCategory]);

  /* ================= EFFECTS ================= */

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (inventoryScrollRef.current) inventoryScrollRef.current.scrollTop = 0;
    fetchInventory(true);
  }, [search, selectedCategory]);

  // Trigger customer search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (showCustomerDropdown) fetchCustomers(true);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch, showCustomerDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= EVENT HANDLERS ================= */

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) {
      fetchInventory(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const current = prev[item._id] || { ...item, quantity: 0 };
      if (current.quantity >= item.quantity) return prev;
      return { ...prev, [item._id]: { ...current, inventory: item._id, name: item.name, price: item.sellingPrice, gstRate: item.gstRate || 0, quantity: current.quantity + 1 } };
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) { const newState = { ...prev }; delete newState[id]; return newState; }
      return { ...prev, [id]: { ...item, quantity: newQty } };
    });
  };

  const subTotal = Object.values(cart).reduce((s, i) => s + (i.price * i.quantity), 0);
  const gstTotal = Object.values(cart).reduce((s, i) => s + (i.price * i.quantity * (i.gstRate / 100)), 0);
  const grandTotal = subTotal + gstTotal;

  useEffect(() => { setPaidAmount(grandTotal); }, [grandTotal]);


  /* ================= PRINTING LOGIC ================= */

  const executeThermalPrint = async (billData) => {
    const printer = window.GLOBAL_PRINTER_HANDLE;
    if (!printer) {
      console.warn("Printer not connected, skipping print.");
      return;
    }

    // Load settings from local storage
    const settings = JSON.parse(localStorage.getItem("billSettings") || "{}");

    // Get Business info from localStorage
    const businessName = localStorage.getItem("businessName") || settings.businessName || "EasyHai";
    const businessAddress = localStorage.getItem("businessAddress") || settings.businessAddress || "";
    const userName = localStorage.getItem("userName") || "";

    try {
      const enc = new TextEncoder();
      const hr = "--------------------------------\n";

      const CMD = {
        INIT: [0x1B, 0x40],
        CENTER: [0x1B, 0x61, 0x01],
        LEFT: [0x1B, 0x61, 0x00],
        BOLD_ON: [0x1B, 0x45, 0x01],
        BOLD_OFF: [0x1B, 0x45, 0x00],
        DOUBLE_HEIGHT: [0x1B, 0x21, 0x10],
        RESET_SIZE: [0x1B, 0x21, 0x00],
        FEED_2: [0x0A, 0x0A],
        CUT: [0x1D, 0x56, 0x00]
      };

      let bytes = [...CMD.INIT];

      /* ================= HEADER ================= */
      // ⭐ Business Name (BOLD + LARGE)
      bytes.push(...CMD.CENTER, ...CMD.BOLD_ON, ...CMD.DOUBLE_HEIGHT);
      bytes.push(...enc.encode(`${businessName}\n`));
      bytes.push(...CMD.RESET_SIZE, ...CMD.BOLD_OFF); // Reset immediately after name

      // Address
      if (businessAddress) {
        bytes.push(...enc.encode(`${businessAddress}\n`));
      }

      // Phone
      if (settings.showPhone && settings.phone) {
        bytes.push(...enc.encode(`Ph: ${settings.phone}\n`));
      }

      // Date & Time (Fixed Format: 26 February 2026)
      let dateTimeStr = "";
      const now = new Date();
      const fullMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const day = now.getDate();
      const month = fullMonths[now.getMonth()];
      const year = now.getFullYear();
      const dateFormatted = `${day} ${month} ${year}`;
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      if (settings.showDate && settings.showTime) dateTimeStr = `${dateFormatted}  ${timeFormatted}`;
      else if (settings.showDate) dateTimeStr = dateFormatted;
      else if (settings.showTime) dateTimeStr = timeFormatted;

      if (dateTimeStr) {
        bytes.push(...enc.encode(`${dateTimeStr}\n`));
      }

      bytes.push(...CMD.LEFT, ...enc.encode(hr));

      /* ================= CUSTOMER ================= */
      if (selectedCustomer) {
        bytes.push(...enc.encode(`Customer: ${selectedCustomer.name}\n`));
        bytes.push(...enc.encode(hr));
      }

      /* ================= ITEMS ================= */
      Object.values(cart).forEach(item => {
        bytes.push(...enc.encode(`${item.name}\n`));
        const qtyRate = `${item.quantity} x ${item.price.toFixed(2)}`;
        const total = (item.quantity * item.price).toFixed(2);
        const spaces = " ".repeat(Math.max(1, 32 - qtyRate.length - total.length));
        bytes.push(...enc.encode(`${qtyRate}${spaces}${total}\n`));
      });

      bytes.push(...enc.encode(hr));

      /* ================= TOTALS ================= */
      const formatRow = (label, value, bold = false) => {
        if (bold) bytes.push(...CMD.BOLD_ON);
        const valStr = value.toFixed(2);
        const spaces = " ".repeat(Math.max(1, 32 - label.length - valStr.length));
        bytes.push(...enc.encode(`${label}${spaces}${valStr}\n`));
        if (bold) bytes.push(...CMD.BOLD_OFF);
      };

      formatRow("Sub Total", subTotal);
      if (settings.showGST && gstTotal > 0) formatRow("GST", gstTotal);
      formatRow("GRAND TOTAL", grandTotal, true);

      bytes.push(...enc.encode(hr));

      /* ================= PAYMENT & FOOTER ================= */
      bytes.push(...enc.encode(`Paid: ${paidAmount.toFixed(2)}\n`));
      if (settings.showPaymentMode) bytes.push(...enc.encode(`Payment: ${paymentType}\n`));

      if (narration) {
        bytes.push(0x0A, ...enc.encode("Note:\n"), ...enc.encode(`${narration}\n`));
      }

      if (settings.showTerms && settings.terms?.length > 0) {
        bytes.push(0x0A, ...enc.encode("Terms:\n"));
        settings.terms.forEach(t => bytes.push(...enc.encode(`- ${t}\n`)));
      }

      bytes.push(...CMD.CENTER);
      if (settings.footer) bytes.push(0x0A, ...enc.encode(`${settings.footer}\n`));

      if (settings.showPrintedBy && userName) {
        bytes.push(0x0A, ...enc.encode(`Printed by: ${userName}\n`));
      }

      if (settings.showQR) bytes.push(0x0A, ...enc.encode("[QR]\n"));

      bytes.push(...CMD.FEED_2, ...CMD.CUT);

      const data = new Uint8Array(bytes);
      await printer.writeValue(data);
    } catch (err) {
      console.error("Print execution failed", err);
    }
  };



  /* ================= UPDATED SAVE HANDLER ================= */

  const handleSave = async () => {
    if (Object.keys(cart).length === 0) return;
    setPrinting(true);
    try {
      const payload = {
        items: Object.values(cart).map(i => ({ inventory: i.inventory, quantity: i.quantity, price: i.price })),
        paymentType, paidAmount, customer: selectedCustomer?._id, notes: narration
      };

      const res = await axios.post(`${API_BASE_URL}/voucher/sales`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        // Trigger Printing after successful save
        await executeThermalPrint(res.data.data);

        setInfoDialog({
          open: true,
          type: "success",
          title: "Bill Saved",
          message: "Transaction completed and printing started!"
        });

        setCart({});
        setSelectedCustomer(null);
        setCustomerSearch("");
      }
    } catch (e) {
      alert(e.response?.data?.message || "Save Failed");
    } finally {
      setPrinting(false);
    }
  };


  const paymentModes = [
    { id: "CASH", label: "Cash", icon: <FiDollarSign /> },
    { id: "UPI", label: "UPI", icon: <FiSmartphone /> },
    { id: "CARD", label: "Card", icon: <FiCreditCard /> },
    { id: "CREDIT", label: "Credit", icon: <FiClock /> },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: BRAND.bg, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

      {/* LEFT: ITEM BROWSER */}
      <div style={{ flex: 2, display: "flex", flexDirection: "column", height: "100vh", borderRight: `1px solid ${BRAND.border}` }}>
        <div style={{ padding: "16px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h2 style={{ margin: 0, color: BRAND.primary, fontSize: "22px", fontWeight: 800 }}>Create Sale</h2>
          <div style={{ display: "flex", background: BRAND.bg, padding: "8px 16px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, width: "40%" }}>
            <FiSearch style={{ marginTop: "3px", marginRight: "10px", color: BRAND.textMuted }} />
            <input style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }} placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ padding: "12px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", gap: "10px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} style={{ padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, backgroundColor: selectedCategory === cat._id ? BRAND.primary : BRAND.bg, color: selectedCategory === cat._id ? "#fff" : BRAND.text, transition: "0.2s", whiteSpace: "nowrap" }}>{cat.name}</button>
          ))}
        </div>

        <div ref={inventoryScrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "20px 30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "16px" }}>
            {inventory.map((item, idx) => (
              <div key={`${item._id}-${idx}`} onClick={() => addToCart(item)} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "14px", border: `1px solid ${BRAND.border}`, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "110px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: BRAND.accent }}>₹{item.sellingPrice.toLocaleString()}</div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text, lineHeight: "1.2" }}>{item.name}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: BRAND.textMuted }}>Stock: {item.quantity}</span>
                  {cart[item._id] && <div style={{ background: BRAND.accent, color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>{cart[item._id].quantity}</div>}
                </div>
              </div>
            ))}
          </div>
          {loading && <div style={{ textAlign: "center", padding: 10 }}>Loading...</div>}
        </div>
      </div>

      {/* RIGHT: BILLING PANEL */}
      <div style={{ flex: 1.1, backgroundColor: "#fff", display: "flex", flexDirection: "column", height: "100vh", boxShadow: "-5px 0 20px rgba(0,0,0,0.05)" }}>

        {/* CUSTOMER SEARCH & SELECT DROPDOWN */}
        <div style={{ padding: "20px 25px", borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0, position: "relative" }} ref={customerDropdownRef}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>Customer</h4>

          {selectedCustomer ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.primary}08`, padding: "10px 15px", borderRadius: "12px", border: `1px solid ${BRAND.primary}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiUser color={BRAND.primary} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text }}>{selectedCustomer.name}</div>
                  <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{selectedCustomer.phone}</div>
                </div>
              </div>
              <FiX onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }} style={{ cursor: "pointer", color: BRAND.textMuted }} />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, display: "flex", background: BRAND.bg, padding: "10px 12px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, alignItems: "center" }}>
                  <FiUser style={{ marginRight: "8px", color: BRAND.textMuted }} />
                  <input
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%" }}
                    placeholder="Search by Name / Phone..."
                    value={customerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowCustomerModal(true)} style={{ background: BRAND.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "0 12px", cursor: "pointer" }}><FiPlus /></button>
              </div>

              {/* CUSTOMER DROPDOWN */}
              {showCustomerDropdown && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownContent} onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollHeight - scrollTop <= clientHeight + 5 && !customerLoading && customerPage <= customerTotalPages) {
                      fetchCustomers();
                    }
                  }}>
                    {customers.length > 0 ? (
                      customers.map(c => (
                        <div key={c._id} style={styles.dropdownItem} onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); }}>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{c.phone} | Bal: ₹{c.openingBalance || 0}</div>
                        </div>
                      ))
                    ) : (
                      !customerLoading && <div style={{ padding: 15, textAlign: "center", fontSize: "13px", color: BRAND.textMuted }}>No customers found</div>
                    )}
                    {customerLoading && <div style={{ padding: 10, textAlign: "center", fontSize: "12px" }}>Loading...</div>}
                  </div>
                  <button style={styles.addNewInDropdown} onClick={() => { setShowCustomerModal(true); setShowCustomerDropdown(false); }}>
                    <FiPlus /> Add New Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BILLING TABLE */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 25px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", borderBottom: `1px solid ${BRAND.bg}`, fontSize: "10px", color: BRAND.textMuted, zIndex: 10 }}>
              <tr><th style={{ textAlign: "left", padding: "12px 0" }}>ITEM</th><th style={{ textAlign: "center" }}>QTY</th><th style={{ textAlign: "right" }}>TOTAL</th></tr>
            </thead>
            <tbody>
              {Object.values(cart).map(item => (
                <tr key={item.inventory} style={{ borderBottom: `1px solid ${BRAND.bg}` }}>
                  <td style={{ padding: "12px 0" }}><div style={{ fontWeight: 700, fontSize: "13px" }}>{item.name}</div><div style={{ fontSize: "10px", color: BRAND.textMuted }}>Rate: ₹{item.price}</div></td>
                  <td style={{ textAlign: "center" }}><div style={{ display: "inline-flex", alignItems: "center", background: BRAND.bg, borderRadius: "6px", padding: "2px" }}><button onClick={() => updateCartQty(item.inventory, -1)} style={styles.qtyBtn}><FiMinus size={10} /></button><span style={{ margin: "0 8px", fontWeight: 700, fontSize: "12px" }}>{item.quantity}</span><button onClick={() => updateCartQty(item.inventory, 1)} style={styles.qtyBtn}><FiPlus size={10} /></button></div></td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: "13px" }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "20px 25px", backgroundColor: BRAND.white, borderTop: `1px solid ${BRAND.border}`, flexShrink: 0 }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: BRAND.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>Payment Method</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {paymentModes.map((mode) => (
                <button key={mode.id} onClick={() => setPaymentType(mode.id)} style={{ ...styles.payBtn, backgroundColor: paymentType === mode.id ? `${BRAND.primary}10` : "transparent", borderColor: paymentType === mode.id ? BRAND.primary : BRAND.border, color: paymentType === mode.id ? BRAND.primary : BRAND.textMuted }}>
                  <span style={{ fontSize: "16px" }}>{mode.icon}</span>{mode.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}><span>Sub-total</span><span style={{ fontWeight: 600 }}>₹{subTotal.toFixed(2)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "13px" }}><span>Taxes</span><span style={{ fontWeight: 600 }}>₹{gstTotal.toFixed(2)}</span></div>
          <div style={{ background: BRAND.primary, color: "#fff", padding: "16px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div><div style={{ fontSize: "10px", opacity: 0.8 }}>Total Payable</div><div style={{ fontSize: "28px", fontWeight: 900 }}>₹{grandTotal.toFixed(2)}</div></div>
            <FiCheckCircle size={28} style={{ opacity: 0.3 }} />
          </div>
          <button onClick={handleSave} disabled={Object.keys(cart).length === 0} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: Object.keys(cart).length > 0 ? BRAND.accent : "#CBD5E1", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <FiPrinter /> Save & Print
          </button>
        </div>
      </div>

      <InformationDialogBox
        open={infoDialog.open} type={infoDialog.type} title={infoDialog.title} message={infoDialog.message}
        onClose={() => { setInfoDialog(p => ({ ...p, open: false })); if (infoDialog.type === "success") navigate("/landing/sales"); }}
      />

      <AddEditCustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={() => { fetchCustomers(true); }}
      />
    </div>
  );
}

const styles = {
  dropdownMenu: {
    position: "absolute", top: "105%", left: 0, right: 0,
    backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    zIndex: 100, border: `1px solid ${BRAND.border}`, overflow: "hidden", display: "flex", flexDirection: "column"
  },
  dropdownContent: { maxHeight: "250px", overflowY: "auto" },
  dropdownItem: {
    padding: "12px 15px", borderBottom: `1px solid ${BRAND.bg}`, cursor: "pointer", transition: "0.2s",
  },
  addNewInDropdown: {
    width: "100%", padding: "12px", border: "none", background: `${BRAND.accent}10`,
    color: BRAND.accent, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderTop: `1px solid ${BRAND.border}`
  },
  qtyBtn: { border: "none", background: "#fff", borderRadius: "4px", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  payBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px 4px", borderRadius: "10px", cursor: "pointer", border: "1px solid", fontSize: "11px", fontWeight: 600, transition: "0.2s" }
};