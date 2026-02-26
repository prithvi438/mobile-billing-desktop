import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiSearch, FiPlus, FiMinus, FiShoppingCart, FiUser, FiSave, FiX, 
  FiCheckCircle, FiPrinter, FiSmartphone, FiDollarSign, FiCreditCard, FiClock
} from "react-icons/fi";
import InformationDialogBox from "../components/InformationDialogBox";
import { API_BASE_URL } from "../constants.js";
import AddEditCustomerModal from "../components/customer/AddEditCustomerModal.jsx";
import { getCustomers } from "../services/customer.service";

const BRAND = {
  primary: "#0B3A6F",
  accent: "#F57C00",
  bg: "#F8FAFC",
  border: "#CBD5E1",
  white: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B"
};

const EditSalesScreen = () => {
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  const { state } = useLocation();
  const sale = state?.sale;

  const inventoryScrollRef = useRef(null);
  const customerDropdownRef = useRef(null);

  /* ================= STATE ================= */
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([{ _id: "all", name: "All Items" }]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [paymentType, setPaymentType] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(0);
  const [narration, setNarration] = useState("");
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [infoDialog, setInfoDialog] = useState({ open: false, type: "info", title: "", message: "", onCloseAction: null });

  /* ================= FETCH LOGIC ================= */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/category?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.data?.data) setCategories([{ _id: "all", name: "All Items" }, ...res.data.data.data]);
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchInventory = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await axios.get(`${API_BASE_URL}/inventory`, {
        params: { page: currentPage, limit: 24, search, category: selectedCategory === "all" ? "" : selectedCategory },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data.data;
      setInventory(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === 24);
      setPage(currentPage + 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, selectedCategory, loading, token, hasMore]);

  const fetchCustomers = useCallback(async (reset = false) => {
    try {
      const res = await getCustomers({ page: reset ? 1 : customerPage, limit: 15, search: customerSearch });
      const payload = res.data.data;
      setCustomers(prev => reset ? payload.data : [...prev, ...payload.data]);
      setCustomerPage((reset ? 1 : customerPage) + 1);
      setCustomerHasMore(payload.meta.totalPages >= customerPage);
    } catch (err) { console.error(err); }
  }, [customerSearch, customerPage]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!sale) { navigate("/landing/sales"); return; }
    
    // Load Sale Data into State
    setSelectedCustomer(sale.customer && !sale.isWalkIn ? sale.customer : null);
    setPaymentType(sale.paymentMode);
    setNarration(sale.notes || "");
    
    const cartObj = {};
    sale.items.forEach((i) => {
      cartObj[i.inventory._id || i.inventory] = {
        inventory: i.inventory._id || i.inventory,
        name: i.inventory?.name || i.inventoryName || "Item",
        price: i.rate,
        gstRate: i.gstRate || 0,
        quantity: i.quantity,
      };
    });
    setCart(cartObj);
    fetchCategories();
  }, [sale, navigate, fetchCategories]);

  useEffect(() => { fetchInventory(true); }, [search, selectedCategory]);

  /* ================= CART LOGIC ================= */
  const addToCart = (item) => {
    setCart(prev => {
      const current = prev[item._id] || { ...item, quantity: 0 };
      if (current.quantity >= item.quantity) return prev;
      return { ...prev, [item._id]: { inventory: item._id, name: item.name, price: item.sellingPrice, gstRate: item.gstRate || 0, quantity: current.quantity + 1 } };
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) { const copy = { ...prev }; delete copy[id]; return copy; }
      return { ...prev, [id]: { ...item, quantity: newQty } };
    });
  };

  const subTotal = Object.values(cart).reduce((s, i) => s + i.price * i.quantity, 0);
  const gstTotal = Object.values(cart).reduce((s, i) => s + (i.price * i.quantity * (i.gstRate / 100)), 0);
  const grandTotal = subTotal + gstTotal;

  useEffect(() => { setPaidAmount(Number(grandTotal.toFixed(2))); }, [grandTotal]);

  const handleUpdate = async () => {
    if (Object.keys(cart).length === 0) return;
    try {
      const payload = {
        items: Object.values(cart).map(i => ({ inventory: i.inventory, quantity: i.quantity, rate: i.price })),
        paymentType, paidAmount, customer: selectedCustomer?._id, notes: narration
      };
      await axios.patch(`${API_BASE_URL}/voucher/sales/${sale._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setInfoDialog({ open: true, type: "success", title: "Sale Updated", message: "Invoice has been modified successfully!", onCloseAction: () => navigate("/landing/sales") });
    } catch (e) { alert("Update Failed"); }
  };

  const paymentModes = [
    { id: "CASH", label: "Cash", icon: <FiDollarSign /> },
    { id: "UPI", label: "UPI", icon: <FiSmartphone /> },
    { id: "CARD", label: "Card", icon: <FiCreditCard /> },
    { id: "CREDIT", label: "Credit", icon: <FiClock /> },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: BRAND.bg, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      
      {/* LEFT: INVENTORY GRID */}
      <div style={{ flex: 2, display: "flex", flexDirection: "column", height: "100vh", borderRight: `1px solid ${BRAND.border}` }}>
        <div style={{ padding: "16px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, color: BRAND.primary, fontSize: "22px", fontWeight: 800 }}>
              Edit Sale <span style={{ color: BRAND.accent, fontSize: "12px", background: `${BRAND.accent}15`, padding: "4px 10px", borderRadius: "20px", marginLeft: 8 }}>Voucher #{sale?.voucher?.voucherNo}</span>
            </h2>
          </div>
          <div style={{ display: "flex", background: BRAND.bg, padding: "8px 16px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, width: "40%" }}>
            <FiSearch style={{ marginTop: "3px", marginRight: "10px", color: BRAND.textMuted }} />
            <input style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }} placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ padding: "12px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", gap: "10px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} style={{ padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, backgroundColor: selectedCategory === cat._id ? BRAND.primary : BRAND.bg, color: selectedCategory === cat._id ? "#fff" : BRAND.text, transition: "0.2s", whiteSpace: "nowrap" }}>
              {cat.name}
            </button>
          ))}
        </div>

        <div ref={inventoryScrollRef} onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) fetchInventory();
        }} style={{ flex: 1, overflowY: "auto", padding: "20px 30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "16px" }}>
            {inventory.map((item, idx) => (
              <div key={`${item._id}-${idx}`} onClick={() => addToCart(item)} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "14px", border: `1px solid ${cart[item._id] ? BRAND.primary : BRAND.border}`, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "110px", boxShadow: cart[item._id] ? "0 4px 12px rgba(11, 58, 111, 0.1)" : "none" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: BRAND.accent }}>₹{item.sellingPrice.toLocaleString()}</div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text }}>{item.name}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: BRAND.textMuted }}>Stock: {item.quantity}</span>
                  {cart[item._id] && <div style={{ background: BRAND.accent, color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>{cart[item._id].quantity}</div>}
                </div>
              </div>
            ))}
          </div>
          {loading && <div style={{ textAlign: "center", padding: 20, color: BRAND.textMuted }}>Loading items...</div>}
        </div>
      </div>

      {/* RIGHT: BILLING PANEL */}
      <div style={{ flex: 1.1, backgroundColor: "#fff", display: "flex", flexDirection: "column", height: "100vh", boxShadow: "-5px 0 20px rgba(0,0,0,0.05)" }}>
        
        <div style={{ padding: "20px 25px", borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0, position: "relative" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>Customer</h4>
          {selectedCustomer ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.primary}08`, padding: "10px 15px", borderRadius: "12px", border: `1px solid ${BRAND.primary}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiUser color={BRAND.primary} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{selectedCustomer.name}</div>
                  <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{selectedCustomer.phone}</div>
                </div>
              </div>
              <FiX onClick={() => setSelectedCustomer(null)} style={{ cursor: "pointer", color: BRAND.textMuted }} />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, display: "flex", background: BRAND.bg, padding: "10px 12px", borderRadius: "10px", border: `1px solid ${BRAND.border}` }}>
                  <FiSearch style={{ marginTop: "2px", marginRight: "8px", color: BRAND.textMuted }} />
                  <input style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%" }} placeholder="Search Customer..." value={customerSearch} onFocus={() => setShowCustomerDropdown(true)} onChange={(e) => setCustomerSearch(e.target.value)} />
                </div>
                <button onClick={() => setShowCustomerModal(true)} style={{ background: BRAND.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "0 12px", cursor: "pointer" }}><FiPlus /></button>
              </div>
              {showCustomerDropdown && (
                <div style={dropdownStyles.menu}>
                   <div style={dropdownStyles.list} onScroll={(e) => {
                     const { scrollTop, scrollHeight, clientHeight } = e.target;
                     if (scrollHeight - scrollTop <= clientHeight + 5 && customerHasMore) fetchCustomers();
                   }}>
                     {customers.map(c => (
                       <div key={c._id} style={dropdownStyles.item} onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); }}>
                         <div style={{ fontWeight: 600 }}>{c.name}</div>
                         <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{c.phone}</div>
                       </div>
                     ))}
                   </div>
                   <button style={dropdownStyles.addBtn} onClick={() => { setShowCustomerModal(true); setShowCustomerDropdown(false); }}><FiPlus /> New Customer</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CART ITEMS */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 25px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", borderBottom: `1px solid ${BRAND.bg}`, fontSize: "10px", color: BRAND.textMuted, zIndex: 10 }}>
              <tr><th style={{ textAlign: "left", padding: "12px 0" }}>ITEM</th><th style={{ textAlign: "center" }}>QTY</th><th style={{ textAlign: "right" }}>TOTAL</th></tr>
            </thead>
            <tbody>
              {Object.values(cart).map(item => (
                <tr key={item.inventory} style={{ borderBottom: `1px solid ${BRAND.bg}` }}>
                  <td style={{ padding: "12px 0" }}><div style={{ fontWeight: 700, fontSize: "13px" }}>{item.name}</div><div style={{ fontSize: "10px", color: BRAND.textMuted }}>₹{item.price}</div></td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", background: BRAND.bg, borderRadius: "6px", padding: "2px" }}>
                      <button onClick={() => updateCartQty(item.inventory, -1)} style={styles.qtyBtn}><FiMinus size={10} /></button>
                      <span style={{ margin: "0 8px", fontWeight: 700, fontSize: "12px" }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.inventory, 1)} style={styles.qtyBtn}><FiPlus size={10} /></button>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: "13px" }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "20px 25px", backgroundColor: BRAND.white, borderTop: `1px solid ${BRAND.border}`, flexShrink: 0 }}>
          <div style={{ marginBottom: "16px" }}>
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
            <div><div style={{ fontSize: "10px", opacity: 0.8 }}>Grand Total</div><div style={{ fontSize: "28px", fontWeight: 900 }}>₹{grandTotal.toFixed(2)}</div></div>
            <FiCheckCircle size={28} style={{ opacity: 0.3 }} />
          </div>

          <button onClick={handleUpdate} disabled={Object.keys(cart).length === 0} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: BRAND.primary, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: `0 4px 12px ${BRAND.primary}40` }}>
            <FiSave /> Update Invoice
          </button>
        </div>
      </div>

      <AddEditCustomerModal open={showCustomerModal} onClose={() => setShowCustomerModal(false)} onSuccess={() => fetchCustomers(true)} />
      <InformationDialogBox open={infoDialog.open} type={infoDialog.type} title={infoDialog.title} message={infoDialog.message} onClose={() => { setInfoDialog(p => ({ ...p, open: false })); if (infoDialog.onCloseAction) infoDialog.onCloseAction(); }} />
    </div>
  );
};

const styles = {
  qtyBtn: { border: "none", background: "#fff", borderRadius: "4px", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  payBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px 4px", borderRadius: "10px", cursor: "pointer", border: "1px solid", fontSize: "11px", fontWeight: 600, transition: "0.2s" }
};

const dropdownStyles = {
  menu: { position: "absolute", top: "105%", left: 0, right: 0, backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 100, border: `1px solid ${BRAND.border}`, overflow: "hidden" },
  list: { maxHeight: "200px", overflowY: "auto" },
  item: { padding: "10px 15px", borderBottom: `1px solid ${BRAND.bg}`, cursor: "pointer" },
  addBtn: { width: "100%", padding: "12px", border: "none", background: `${BRAND.accent}10`, color: BRAND.accent, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }
};

export default EditSalesScreen;