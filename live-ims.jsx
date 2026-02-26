import { useState, useEffect, useMemo } from "react";

// ─── Persistent Storage Helpers ───────────────────────────────────────────────
const KEYS = {
  items: "ims_items",
  purchases: "ims_purchases",
  sales: "ims_sales",
};

const load = async (key, fallback) => {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
};

const save = async (key, data) => {
  try {
    await window.storage.set(key, JSON.stringify(data));
  } catch {}
};

// ─── Seed Data from screenshot ─────────────────────────────────────────────
const SEED_ITEMS = [
  { id: "MAM-18", name: "Mamypoko pants(Diapers) Size-S", category: "Baby & Kids Care", moq: 12, maxLevel: 5, sellingPrice: 0, reorderLevel: 2 },
  { id: "BAB-19", name: "Baby Wipes", category: "Baby & Kids Care", moq: 2, maxLevel: 5, sellingPrice: 0, reorderLevel: 2 },
  { id: "JOH-20", name: "Johnsons Baby Soap 50gm", category: "Baby & Kids Care", moq: 6, maxLevel: 5, sellingPrice: 0, reorderLevel: 2 },
  { id: "MAM-232", name: "Mamypoko pants (Diapers) Size-M", category: "Baby & Kids Care", moq: 1, maxLevel: 1, sellingPrice: 10, reorderLevel: 1 },
  { id: "JOH-555", name: "Johnson & Johnson Baby Cream", category: "Baby & Kids Care", moq: 1, maxLevel: 2, sellingPrice: 59, reorderLevel: 1 },
  { id: "JOH-556", name: "Johnson's Natural Baby Powder", category: "Baby & Kids Care", moq: 1, maxLevel: 2, sellingPrice: 59, reorderLevel: 1 },
  { id: "MAM-560", name: "Mamypoko pants (Diapers) Size-L", category: "Baby & Kids Care", moq: 1, maxLevel: 2, sellingPrice: 12, reorderLevel: 1 },
  { id: "WAT-168", name: "Water Bottles", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 0, reorderLevel: 1 },
  { id: "RJC-187", name: "RJC Cold Drink(Orange)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 5.41, reorderLevel: 1 },
  { id: "RJC-188", name: "RJC Cold Drink(Lemon)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 5.41, reorderLevel: 1 },
  { id: "RJC-189", name: "RJC Cold Drink(Black)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 5.41, reorderLevel: 1 },
  { id: "RJC-190", name: "RJC Cold Drink(Green)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 5.41, reorderLevel: 1 },
  { id: "PEP-234", name: "Pepsodent Toothpaste Whitening 80g", category: "Health & Hygiene", moq: 1, maxLevel: 1, sellingPrice: 62, reorderLevel: 1 },
  { id: "Dou-235", name: "Douber Red", category: "Health & Hygiene", moq: 1, maxLevel: 1, sellingPrice: 19, reorderLevel: 1 },
  { id: "Clo-236", name: "Closeup 80g", category: "Health & Hygiene", moq: 1, maxLevel: 1, sellingPrice: 50, reorderLevel: 1 },
  { id: "CLE-237", name: "Clear Soda (Plain)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 0, reorderLevel: 1 },
  { id: "PAC-238", name: "Glow & Lovely 25g", category: "Personal Care", moq: 1, maxLevel: 1, sellingPrice: 65, reorderLevel: 1 },
  { id: "HEA-241", name: "Health Drink Powder", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 0, reorderLevel: 1 },
  { id: "COC-321", name: "Coca cola (Zero Sugar)", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 33, reorderLevel: 5 },
  { id: "LIM-322", name: "Limca", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 33, reorderLevel: 3 },
  { id: "MOU-323", name: "Mountain Dew", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 33, reorderLevel: 5 },
  { id: "MAN-324", name: "Mango Maaza", category: "Beverages", moq: 1, maxLevel: 1, sellingPrice: 45, reorderLevel: 2 },
  { id: "APP-372", name: "Appy fizz", category: "Beverages", moq: 2, maxLevel: 1, sellingPrice: 9, reorderLevel: 2 },
  { id: "STI-373", name: "Sting Energy", category: "Beverages", moq: 2, maxLevel: 2, sellingPrice: 18, reorderLevel: 2 },
  { id: "PEP-427", name: "Pepsi Bottle 600ML", category: "Beverages", moq: 2, maxLevel: 2, sellingPrice: 33, reorderLevel: 2 },
  { id: "THU-428", name: "Thumsup-750ml", category: "Beverages", moq: 2, maxLevel: 2, sellingPrice: 33, reorderLevel: 2 },
  { id: "NAV-467", name: "Navratan Tea 250g", category: "Beverages", moq: 2, maxLevel: 2, sellingPrice: 87, reorderLevel: 2 },
  { id: "BIS-501", name: "Bisleri", category: "Beverages", moq: 1, maxLevel: 10, sellingPrice: 0, reorderLevel: 5 },
  { id: "SPR-509", name: "Sprite Bottle-750ml", category: "Beverages", moq: 1, maxLevel: 20, sellingPrice: 33, reorderLevel: 5 },
  { id: "MIR-510", name: "Mirinda Orange-750ml", category: "Beverages", moq: 1, maxLevel: 20, sellingPrice: 33, reorderLevel: 5 },
  { id: "PAR-111", name: "Parle-G", category: "Biscuit", moq: 1, maxLevel: 1, sellingPrice: 4.50, reorderLevel: 10 },
];

const CATEGORIES = ["All", "Baby & Kids Care", "Beverages", "Health & Hygiene", "Personal Care", "Biscuit"];
const TABS = ["📊 Dashboard", "📦 Items", "🛒 Purchase", "💸 Sales", "🔔 Reorder", "📈 Reports"];

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0" },
  header: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "16px 24px", borderBottom: "2px solid #e94560", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 22, fontWeight: 700, color: "#e94560", letterSpacing: 2, textTransform: "uppercase" },
  logoSub: { fontSize: 11, color: "#a0aec0", letterSpacing: 4 },
  nav: { display: "flex", gap: 4, padding: "12px 24px", background: "#0d0d1a", borderBottom: "1px solid #1e293b", overflowX: "auto" },
  tab: (active) => ({ padding: "8px 16px", borderRadius: 6, border: active ? "1px solid #e94560" : "1px solid #1e293b", background: active ? "#e94560" : "transparent", color: active ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" }),
  main: { padding: "24px", maxWidth: 1400, margin: "0 auto" },
  card: { background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 20 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  stat: (color) => ({ background: "#111827", border: `1px solid ${color}33`, borderRadius: 10, padding: 18, borderLeft: `4px solid ${color}` }),
  statVal: (color) => ({ fontSize: 26, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }),
  statLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginTop: 4 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "#0d0d1a", color: "#e94560", padding: "10px 14px", textAlign: "left", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", borderBottom: "2px solid #e94560" },
  td: { padding: "10px 14px", borderBottom: "1px solid #1e293b", color: "#cbd5e1" },
  tr: (i) => ({ background: i % 2 === 0 ? "#0f172a" : "#111827" }),
  input: { background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "8px 12px", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" },
  select: { background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "8px 12px", fontFamily: "inherit", fontSize: 13, outline: "none" },
  btn: (color = "#e94560") => ({ background: color, border: "none", borderRadius: 6, color: "#fff", padding: "10px 20px", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: 600, letterSpacing: 1 }),
  btnSm: (color = "#e94560") => ({ background: color, border: "none", borderRadius: 4, color: "#fff", padding: "5px 10px", fontFamily: "inherit", fontSize: 11, cursor: "pointer", fontWeight: 600 }),
  formRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 },
  label: { fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 4, display: "block" },
  badge: (color) => ({ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }),
  alert: { background: "#7c3aed22", border: "1px solid #7c3aed", borderRadius: 8, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" },
  section: { fontSize: 16, fontWeight: 700, color: "#e94560", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1e293b", paddingBottom: 8 },
  profit: (v) => ({ color: v > 0 ? "#10b981" : v < 0 ? "#ef4444" : "#64748b", fontWeight: 700 }),
};

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  // Load from storage
  useEffect(() => {
    (async () => {
      const [i, p, s] = await Promise.all([load(KEYS.items, SEED_ITEMS), load(KEYS.purchases, []), load(KEYS.sales, [])]);
      setItems(i);
      setPurchases(p);
      setSales(s);
      setLoaded(true);
    })();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateItems = async (newItems) => { setItems(newItems); await save(KEYS.items, newItems); };
  const updatePurchases = async (newP) => { setPurchases(newP); await save(KEYS.purchases, newP); };
  const updateSales = async (newS) => { setSales(newS); await save(KEYS.sales, newS); };

  // ── Derived: last purchase price per SKU
  const lastPurchasePrice = useMemo(() => {
    const map = {};
    [...purchases].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((p) => {
      map[p.sku] = p.purchasePrice;
    });
    return map;
  }, [purchases]);

  // ── Derived: stock per SKU
  const stockMap = useMemo(() => {
    const map = {};
    items.forEach((i) => { map[i.id] = 0; });
    purchases.forEach((p) => { map[p.sku] = (map[p.sku] || 0) + Number(p.qty); });
    sales.forEach((s) => { map[s.sku] = (map[s.sku] || 0) - Number(s.qty); });
    return map;
  }, [items, purchases, sales]);

  // ── Derived: enriched items
  const enriched = useMemo(() =>
    items.map((item) => {
      const stock = stockMap[item.id] ?? 0;
      const lpp = lastPurchasePrice[item.id] ?? 0;
      const profit = item.sellingPrice - lpp;
      const profitPct = lpp > 0 ? ((profit / lpp) * 100).toFixed(1) : 0;
      const needsReorder = stock <= item.reorderLevel;
      return { ...item, stock, lpp, profit, profitPct, needsReorder };
    }), [items, lastPurchasePrice, stockMap]);

  // ── Dashboard Stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const reorderItems = enriched.filter((i) => i.needsReorder).length;
    const totalStockValue = enriched.reduce((s, i) => s + i.stock * i.lpp, 0);
    const totalSalesValue = sales.reduce((s, sale) => {
      const item = items.find((i) => i.id === sale.sku);
      return s + (item?.sellingPrice || 0) * sale.qty;
    }, 0);
    const totalCostOfSales = sales.reduce((s, sale) => {
      const lpp = lastPurchasePrice[sale.sku] || 0;
      return s + lpp * sale.qty;
    }, 0);
    const totalProfit = totalSalesValue - totalCostOfSales;
    return { totalItems, reorderItems, totalStockValue, totalSalesValue, totalProfit };
  }, [enriched, sales, items, lastPurchasePrice]);

  if (!loaded) return <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><span style={{ color: "#e94560", fontSize: 20 }}>Loading IMS...</span></div>;

  return (
    <div style={S.app}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.logo}>DG Store IMS</div>
          <div style={S.logoSub}>Inventory Management System v3.0</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#64748b" }}>
          <div>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          {stats.reorderItems > 0 && <div style={{ color: "#f59e0b", marginTop: 4 }}>⚠ {stats.reorderItems} items need reorder</div>}
        </div>
      </div>

      {/* Nav */}
      <div style={S.nav}>
        {TABS.map((t, i) => <button key={i} style={S.tab(tab === i)} onClick={() => setTab(i)}>{t}</button>)}
      </div>

      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 20px", borderRadius: 8, zIndex: 999, fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{toast.msg}</div>}

      <div style={S.main}>
        {tab === 0 && <Dashboard stats={stats} enriched={enriched} purchases={purchases} sales={sales} />}
        {tab === 1 && <ItemsTab items={enriched} updateItems={updateItems} showToast={showToast} />}
        {tab === 2 && <PurchaseTab items={items} purchases={purchases} updatePurchases={updatePurchases} showToast={showToast} />}
        {tab === 3 && <SalesTab items={enriched} sales={sales} updateSales={updateSales} showToast={showToast} />}
        {tab === 4 && <ReorderTab enriched={enriched} purchases={purchases} updatePurchases={updatePurchases} showToast={showToast} />}
        {tab === 5 && <ReportsTab enriched={enriched} purchases={purchases} sales={sales} />}
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ stats, enriched, purchases, sales }) {
  const reorderItems = enriched.filter((i) => i.needsReorder);
  const topProfit = [...enriched].filter(i => i.profit > 0).sort((a, b) => b.profitPct - a.profitPct).slice(0, 5);
  const recent = [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div>
      <div style={S.statGrid}>
        <StatCard val={stats.totalItems} label="Total Items" color="#3b82f6" prefix="" suffix="" />
        <StatCard val={`₹${stats.totalStockValue.toFixed(0)}`} label="Stock Value" color="#10b981" />
        <StatCard val={`₹${stats.totalSalesValue.toFixed(0)}`} label="Total Sales" color="#f59e0b" />
        <StatCard val={`₹${stats.totalProfit.toFixed(0)}`} label="Total Profit" color={stats.totalProfit >= 0 ? "#10b981" : "#ef4444"} />
        <StatCard val={stats.reorderItems} label="Need Reorder" color="#ef4444" suffix="" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Reorder Alerts */}
        <div style={S.card}>
          <div style={S.section}>🔴 Reorder Alerts</div>
          {reorderItems.length === 0 ? <div style={{ color: "#10b981" }}>✓ All items well stocked</div> :
            reorderItems.slice(0, 6).map((item) => (
              <div key={item.id} style={{ ...S.alert, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.id} • Stock: <span style={{ color: "#ef4444" }}>{item.stock}</span> / Reorder at: {item.reorderLevel}</div>
                </div>
                <span style={S.badge("#ef4444")}>LOW</span>
              </div>
            ))}
        </div>

        {/* Top Margin Items */}
        <div style={S.card}>
          <div style={S.section}>📈 Top Margin Items</div>
          {topProfit.map((item, i) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
              <div>
                <span style={{ color: "#f59e0b", marginRight: 8 }}>#{i + 1}</span>
                <span style={{ fontSize: 13 }}>{item.name.slice(0, 28)}</span>
              </div>
              <span style={{ color: "#10b981", fontWeight: 700 }}>{item.profitPct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchases */}
      <div style={S.card}>
        <div style={S.section}>🛒 Recent Purchases</div>
        {recent.length === 0 ? <div style={{ color: "#64748b" }}>No purchases yet</div> : (
          <table style={S.table}>
            <thead><tr>
              {["Date", "SKU", "Item", "Qty", "Price", "Total"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>{recent.map((p, i) => (
              <tr key={p.id} style={S.tr(i)}>
                <td style={S.td}>{p.date}</td>
                <td style={S.td}><span style={S.badge("#3b82f6")}>{p.sku}</span></td>
                <td style={S.td}>{p.itemName}</td>
                <td style={S.td}>{p.qty}</td>
                <td style={S.td}>₹{p.purchasePrice}</td>
                <td style={S.td}>₹{(p.qty * p.purchasePrice).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ val, label, color }) {
  return (
    <div style={S.stat(color)}>
      <div style={S.statVal(color)}>{val}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

// ─── Items Tab ─────────────────────────────────────────────────────────────
function ItemsTab({ items, updateItems, showToast }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", category: "Beverages", moq: 1, maxLevel: 5, sellingPrice: 0, reorderLevel: 2 });

  const filtered = items.filter((i) =>
    (cat === "All" || i.category === cat) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveEdit = async () => {
    const updated = items.map((i) => i.id === editing.id ? { ...i, sellingPrice: Number(editing.sellingPrice), reorderLevel: Number(editing.reorderLevel), maxLevel: Number(editing.maxLevel) } : i);
    await updateItems(updated);
    setEditing(null);
    showToast("Item updated!");
  };

  const handleAddItem = async () => {
    if (!form.id || !form.name) return showToast("SKU & Name required", "error");
    if (items.find(i => i.id === form.id)) return showToast("SKU already exists", "error");
    await updateItems([...items, { ...form, moq: Number(form.moq), maxLevel: Number(form.maxLevel), sellingPrice: Number(form.sellingPrice), reorderLevel: Number(form.reorderLevel) }]);
    setShowAdd(false);
    setForm({ id: "", name: "", category: "Beverages", moq: 1, maxLevel: 5, sellingPrice: 0, reorderLevel: 2 });
    showToast("Item added!");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input style={{ ...S.input, maxWidth: 260 }} placeholder="🔍 Search item or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={S.select} value={cat} onChange={e => setCat(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button style={S.btn()} onClick={() => setShowAdd(!showAdd)}>+ Add New Item</button>
      </div>

      {showAdd && (
        <div style={{ ...S.card, borderColor: "#e94560" }}>
          <div style={S.section}>Add New Item</div>
          <div style={S.formRow}>
            <div><label style={S.label}>SKU Code *</label><input style={S.input} value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. COL-100" /></div>
            <div><label style={S.label}>Item Name *</label><input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label style={S.label}>Category</label><select style={S.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={S.label}>Selling Price (₹)</label><input style={S.input} type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} /></div>
            <div><label style={S.label}>MOQ</label><input style={S.input} type="number" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} /></div>
            <div><label style={S.label}>Max Level</label><input style={S.input} type="number" value={form.maxLevel} onChange={e => setForm({ ...form, maxLevel: e.target.value })} /></div>
            <div><label style={S.label}>Reorder Level</label><input style={S.input} type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={S.btn("#10b981")} onClick={handleAddItem}>✓ Save Item</button>
            <button style={S.btn("#64748b")} onClick={() => setShowAdd(false)}>✕ Cancel</button>
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{filtered.length} items shown</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>
              {["SKU", "Item Name", "Category", "Sell Price", "Last Buy", "Profit", "Margin%", "Stock", "Status", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} style={S.tr(i)}>
                  <td style={S.td}><span style={S.badge("#3b82f6")}>{item.id}</span></td>
                  <td style={S.td}>{item.name}</td>
                  <td style={S.td}><span style={S.badge("#7c3aed")}>{item.category}</span></td>
                  {editing?.id === item.id ? (
                    <>
                      <td style={S.td}><input style={{ ...S.input, width: 80 }} type="number" value={editing.sellingPrice} onChange={e => setEditing({ ...editing, sellingPrice: e.target.value })} /></td>
                      <td style={S.td}>₹{item.lpp || "—"}</td>
                      <td style={S.td}>—</td>
                      <td style={S.td}><input style={{ ...S.input, width: 70 }} type="number" value={editing.reorderLevel} onChange={e => setEditing({ ...editing, reorderLevel: e.target.value })} /></td>
                    </>
                  ) : (
                    <>
                      <td style={S.td}>₹{item.sellingPrice || "—"}</td>
                      <td style={S.td}>{item.lpp ? `₹${item.lpp}` : "—"}</td>
                      <td style={{ ...S.td, ...S.profit(item.profit) }}>{item.lpp ? `₹${item.profit.toFixed(2)}` : "—"}</td>
                      <td style={{ ...S.td, ...S.profit(item.profit) }}>{item.lpp && item.sellingPrice ? `${item.profitPct}%` : "—"}</td>
                    </>
                  )}
                  <td style={S.td}>
                    <span style={{ color: item.stock > item.reorderLevel ? "#10b981" : "#ef4444", fontWeight: 700 }}>{item.stock}</span>
                  </td>
                  <td style={S.td}>
                    {item.needsReorder ? <span style={S.badge("#ef4444")}>LOW</span> : <span style={S.badge("#10b981")}>OK</span>}
                  </td>
                  <td style={S.td}>
                    {editing?.id === item.id
                      ? <><button style={S.btnSm("#10b981")} onClick={handleSaveEdit}>✓</button> <button style={S.btnSm("#64748b")} onClick={() => setEditing(null)}>✕</button></>
                      : <button style={S.btnSm("#f59e0b")} onClick={() => setEditing({ ...item })}>✏ Edit</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Purchase Tab ──────────────────────────────────────────────────────────
function PurchaseTab({ items, purchases, updatePurchases, showToast }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), sku: "", qty: "", purchasePrice: "", supplier: "", notes: "" });
  const [search, setSearch] = useState("");
  const selectedItem = items.find(i => i.id === form.sku);

  const recentPurchases = useMemo(() => {
    const map = {};
    [...purchases].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => { map[p.sku] = p.purchasePrice; });
    return map;
  }, [purchases]);

  const handleAdd = async () => {
    if (!form.sku || !form.qty || !form.purchasePrice) return showToast("SKU, Qty & Price required", "error");
    const item = items.find(i => i.id === form.sku);
    if (!item) return showToast("Invalid SKU", "error");
    const entry = { id: Date.now().toString(), ...form, qty: Number(form.qty), purchasePrice: Number(form.purchasePrice), itemName: item.name };
    await updatePurchases([...purchases, entry]);
    setForm({ date: form.date, sku: "", qty: "", purchasePrice: "", supplier: "", notes: "" });
    showToast(`✓ Purchase recorded — ${item.name}`);
  };

  const filtered = [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date)).filter(p =>
    !search || p.sku.includes(search.toUpperCase()) || p.itemName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Form */}
      <div style={{ ...S.card, borderColor: "#3b82f6" }}>
        <div style={S.section}>🛒 New Purchase Entry</div>
        <div style={S.formRow}>
          <div>
            <label style={S.label}>Date</label>
            <input style={S.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>SKU Code</label>
            <select style={S.select} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value, purchasePrice: recentPurchases[e.target.value] || "" })}>
              <option value="">— Select Item —</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.id} — {i.name.slice(0, 30)}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Quantity</label>
            <input style={S.input} type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="Units purchased" />
          </div>
          <div>
            <label style={S.label}>Purchase Price per Unit (₹)
              {recentPurchases[form.sku] && <span style={{ color: "#f59e0b", marginLeft: 6 }}>Last: ₹{recentPurchases[form.sku]}</span>}
            </label>
            <input style={S.input} type="number" step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="₹ per unit" />
          </div>
          <div>
            <label style={S.label}>Supplier</label>
            <input style={S.input} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
          </div>
          <div>
            <label style={S.label}>Notes</label>
            <input style={S.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
          </div>
        </div>

        {selectedItem && form.purchasePrice && (
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div><span style={{ color: "#64748b" }}>Item: </span><span style={{ color: "#e2e8f0" }}>{selectedItem.name}</span></div>
            <div><span style={{ color: "#64748b" }}>Qty × Price: </span><span style={{ color: "#f59e0b" }}>₹{(form.qty * form.purchasePrice).toFixed(2)}</span></div>
            {selectedItem.sellingPrice > 0 && <div><span style={{ color: "#64748b" }}>Expected Profit/unit: </span><span style={S.profit(selectedItem.sellingPrice - form.purchasePrice)}>₹{(selectedItem.sellingPrice - form.purchasePrice).toFixed(2)}</span></div>}
          </div>
        )}
        <button style={S.btn()} onClick={handleAdd}>+ Record Purchase</button>
      </div>

      {/* History */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={S.section}>Purchase History</div>
          <input style={{ ...S.input, maxWidth: 220 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Date", "SKU", "Item", "Qty", "Price/Unit", "Total", "Supplier"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={S.tr(i)}>
                  <td style={S.td}>{p.date}</td>
                  <td style={S.td}><span style={S.badge("#3b82f6")}>{p.sku}</span></td>
                  <td style={S.td}>{p.itemName}</td>
                  <td style={S.td}>{p.qty}</td>
                  <td style={S.td}>₹{p.purchasePrice}</td>
                  <td style={{ ...S.td, color: "#f59e0b", fontWeight: 700 }}>₹{(p.qty * p.purchasePrice).toFixed(2)}</td>
                  <td style={S.td}>{p.supplier || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sales Tab ─────────────────────────────────────────────────────────────
function SalesTab({ items, sales, updateSales, showToast }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), sku: "", qty: "", salePrice: "" });
  const selectedItem = items.find(i => i.id === form.sku);

  const handleAdd = async () => {
    if (!form.sku || !form.qty) return showToast("SKU & Qty required", "error");
    const item = items.find(i => i.id === form.sku);
    if (!item) return showToast("Invalid SKU", "error");
    if (item.stock < Number(form.qty)) return showToast(`Insufficient stock! Only ${item.stock} available`, "error");
    const entry = { id: Date.now().toString(), ...form, qty: Number(form.qty), salePrice: Number(form.salePrice) || item.sellingPrice, itemName: item.name };
    await updateSales([...sales, entry]);
    setForm({ date: form.date, sku: "", qty: "", salePrice: "" });
    showToast(`✓ Sale recorded — ${item.name}`);
  };

  const sorted = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ ...S.card, borderColor: "#10b981" }}>
        <div style={S.section}>💸 New Sale Entry</div>
        <div style={S.formRow}>
          <div>
            <label style={S.label}>Date</label>
            <input style={S.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>SKU Code</label>
            <select style={S.select} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value, salePrice: items.find(i => i.id === e.target.value)?.sellingPrice || "" })}>
              <option value="">— Select Item —</option>
              {items.filter(i => i.stock > 0).map(i => <option key={i.id} value={i.id}>{i.id} — {i.name.slice(0, 28)} [Stock: {i.stock}]</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Qty Sold</label>
            <input style={S.input} type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Sale Price/Unit (₹)</label>
            <input style={S.input} type="number" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
          </div>
        </div>
        {selectedItem && (
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 24 }}>
            <div><span style={{ color: "#64748b" }}>Stock: </span><span style={{ color: "#10b981" }}>{selectedItem.stock}</span></div>
            <div><span style={{ color: "#64748b" }}>MRP: </span><span style={{ color: "#e2e8f0" }}>₹{selectedItem.sellingPrice}</span></div>
            <div><span style={{ color: "#64748b" }}>Buy Price: </span><span style={{ color: "#e2e8f0" }}>₹{selectedItem.lpp || "N/A"}</span></div>
            {form.qty && form.salePrice && <div><span style={{ color: "#64748b" }}>Total: </span><span style={{ color: "#f59e0b", fontWeight: 700 }}>₹{(form.qty * form.salePrice).toFixed(2)}</span></div>}
          </div>
        )}
        <button style={S.btn("#10b981")} onClick={handleAdd}>+ Record Sale</button>
      </div>

      <div style={S.card}>
        <div style={S.section}>Sales History</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Date", "SKU", "Item", "Qty", "Sale Price", "Revenue", "Buy Price", "Profit"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {sorted.map((s, i) => {
                const item = items.find(it => it.id === s.sku);
                const profit = (s.salePrice - (item?.lpp || 0)) * s.qty;
                return (
                  <tr key={s.id} style={S.tr(i)}>
                    <td style={S.td}>{s.date}</td>
                    <td style={S.td}><span style={S.badge("#10b981")}>{s.sku}</span></td>
                    <td style={S.td}>{s.itemName}</td>
                    <td style={S.td}>{s.qty}</td>
                    <td style={S.td}>₹{s.salePrice}</td>
                    <td style={{ ...S.td, color: "#f59e0b" }}>₹{(s.qty * s.salePrice).toFixed(2)}</td>
                    <td style={S.td}>{item?.lpp ? `₹${item.lpp}` : "—"}</td>
                    <td style={{ ...S.td, ...S.profit(profit) }}>₹{profit.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Reorder Tab ───────────────────────────────────────────────────────────
function ReorderTab({ enriched, purchases, updatePurchases, showToast }) {
  const reorderItems = enriched.filter(i => i.needsReorder);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().slice(0, 10));
  const [overrides, setOverrides] = useState({});

  const recentPurchasePrice = useMemo(() => {
    const map = {};
    [...purchases].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => { map[p.sku] = p.purchasePrice; });
    return map;
  }, [purchases]);

  const handleReorderAll = async () => {
    const newEntries = reorderItems.map(item => ({
      id: Date.now().toString() + item.id,
      date: bulkDate,
      sku: item.id,
      qty: overrides[item.id]?.qty ?? item.moq,
      purchasePrice: overrides[item.id]?.price ?? recentPurchasePrice[item.id] ?? 0,
      supplier: "",
      notes: "Auto-reorder",
      itemName: item.name,
    })).filter(e => e.purchasePrice > 0);
    await updatePurchases([...purchases, ...newEntries]);
    showToast(`✓ ${newEntries.length} items reordered!`);
  };

  return (
    <div>
      <div style={{ ...S.card, borderColor: "#ef4444" }}>
        <div style={S.section}>🔔 Items Needing Reorder ({reorderItems.length})</div>
        {reorderItems.length === 0 ? (
          <div style={{ color: "#10b981", padding: 20, textAlign: "center", fontSize: 16 }}>✓ All items are well stocked!</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
              <div><label style={S.label}>Reorder Date</label><input style={S.input} type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} /></div>
              <button style={{ ...S.btn("#ef4444"), marginTop: 20 }} onClick={handleReorderAll}>⚡ Reorder All (using last prices)</button>
            </div>
            <table style={S.table}>
              <thead><tr>{["SKU", "Item", "Category", "Current Stock", "Reorder Level", "Last Buy ₹", "Reorder Qty", "Override Qty", "Override Price"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {reorderItems.map((item, i) => (
                  <tr key={item.id} style={S.tr(i)}>
                    <td style={S.td}><span style={S.badge("#ef4444")}>{item.id}</span></td>
                    <td style={S.td}>{item.name}</td>
                    <td style={S.td}>{item.category}</td>
                    <td style={{ ...S.td, color: "#ef4444", fontWeight: 700 }}>{item.stock}</td>
                    <td style={S.td}>{item.reorderLevel}</td>
                    <td style={S.td}>{recentPurchasePrice[item.id] ? `₹${recentPurchasePrice[item.id]}` : "—"}</td>
                    <td style={S.td}>{item.moq}</td>
                    <td style={S.td}><input style={{ ...S.input, width: 70 }} type="number" placeholder={item.moq} onChange={e => setOverrides(o => ({ ...o, [item.id]: { ...o[item.id], qty: Number(e.target.value) } }))} /></td>
                    <td style={S.td}><input style={{ ...S.input, width: 80 }} type="number" placeholder={recentPurchasePrice[item.id] || "Price"} onChange={e => setOverrides(o => ({ ...o, [item.id]: { ...o[item.id], price: Number(e.target.value) } }))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Reports Tab ───────────────────────────────────────────────────────────
function ReportsTab({ enriched, purchases, sales }) {
  const categoryStats = useMemo(() => {
    const map = {};
    enriched.forEach(item => {
      if (!map[item.category]) map[item.category] = { items: 0, stockValue: 0, totalProfit: 0 };
      map[item.category].items++;
      map[item.category].stockValue += item.stock * item.lpp;
      map[item.category].totalProfit += item.profit * item.stock;
    });
    return Object.entries(map).sort((a, b) => b[1].stockValue - a[1].stockValue);
  }, [enriched]);

  const totalPurchaseValue = purchases.reduce((s, p) => s + p.qty * p.purchasePrice, 0);
  const totalSalesRevenue = sales.reduce((s, sl) => {
    const item = enriched.find(i => i.id === sl.sku);
    return s + sl.qty * (sl.salePrice || item?.sellingPrice || 0);
  }, 0);
  const totalCOGS = sales.reduce((s, sl) => {
    const lpp = enriched.find(i => i.id === sl.sku)?.lpp || 0;
    return s + sl.qty * lpp;
  }, 0);

  return (
    <div>
      <div style={S.statGrid}>
        <StatCard val={`₹${totalPurchaseValue.toFixed(0)}`} label="Total Purchased" color="#3b82f6" />
        <StatCard val={`₹${totalSalesRevenue.toFixed(0)}`} label="Total Revenue" color="#f59e0b" />
        <StatCard val={`₹${totalCOGS.toFixed(0)}`} label="Cost of Goods Sold" color="#ef4444" />
        <StatCard val={`₹${(totalSalesRevenue - totalCOGS).toFixed(0)}`} label="Gross Profit" color="#10b981" />
      </div>

      <div style={S.card}>
        <div style={S.section}>📊 Category-wise Analysis</div>
        <table style={S.table}>
          <thead><tr>{["Category", "Items", "Stock Value", "Potential Profit"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {categoryStats.map(([cat, data], i) => (
              <tr key={cat} style={S.tr(i)}>
                <td style={S.td}><span style={S.badge("#7c3aed")}>{cat}</span></td>
                <td style={S.td}>{data.items}</td>
                <td style={{ ...S.td, color: "#f59e0b" }}>₹{data.stockValue.toFixed(2)}</td>
                <td style={{ ...S.td, ...S.profit(data.totalProfit) }}>₹{data.totalProfit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <div style={S.section}>📦 Full Inventory Report</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["SKU", "Item", "Stock", "Buy Price", "Sell Price", "Profit/Unit", "Margin%", "Stock Value", "Potential Profit"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {enriched.map((item, i) => (
                <tr key={item.id} style={S.tr(i)}>
                  <td style={S.td}><span style={S.badge("#3b82f6")}>{item.id}</span></td>
                  <td style={S.td}>{item.name}</td>
                  <td style={{ ...S.td, color: item.needsReorder ? "#ef4444" : "#10b981", fontWeight: 700 }}>{item.stock}</td>
                  <td style={S.td}>{item.lpp ? `₹${item.lpp}` : "—"}</td>
                  <td style={S.td}>{item.sellingPrice ? `₹${item.sellingPrice}` : "—"}</td>
                  <td style={{ ...S.td, ...S.profit(item.profit) }}>{item.lpp && item.sellingPrice ? `₹${item.profit.toFixed(2)}` : "—"}</td>
                  <td style={{ ...S.td, ...S.profit(item.profit) }}>{item.lpp && item.sellingPrice ? `${item.profitPct}%` : "—"}</td>
                  <td style={{ ...S.td, color: "#f59e0b" }}>{item.lpp ? `₹${(item.stock * item.lpp).toFixed(2)}` : "—"}</td>
                  <td style={{ ...S.td, ...S.profit(item.profit) }}>{item.lpp && item.sellingPrice ? `₹${(item.profit * item.stock).toFixed(2)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
