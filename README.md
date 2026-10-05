# ecommerceOS-ERP-ystem

## Enterprise eCommerce Operating System (ERP)

CommerceOS is a high-performance, modular enterprise eCommerce Operating System (ERP) engineered for multi-store retail, wholesale (B2B), warehouse logistics (WMS), and financial accounting.

---

## 🚀 Key Platform Features

- **Omnichannel Multi-Storefront Engine:**
  - **Fernhill US** (DTC Retail in USD)
  - **Fernhill EU** (International DTC in EUR)
  - **Wholesale Portal** (B2B Commercial Accounts with Net 30/45 Terms)
  - **Amazon US** (FBM / 3P Marketplace)
  - 1-click store switching and consolidated multi-store revenue aggregation ($820k+/month).

- **11 Integrated Enterprise Modules & 74 Production Screens:**
  1. **Executive Command Center:** Real-time KPI ribbons, interactive sales velocity charts with hover crosshairs, and prioritized actionable task queues.
  2. **Sales & Order Management:** Faceted filtering, saved custom views, bulk action batch allocation, carrier manifest generation, and abandoned cart recovery.
  3. **Master Catalog & Taxonomy:** Multi-dimensional SKU variants (Size × Color × Material), GTIN/UPC barcodes, dynamic margin collections, and review moderation.
  4. **Multi-Warehouse Inventory Control:** Real-time 4-bucket tracking (On Hand, Allocated, Available, In Transit) across 4 global fulfillment nodes.
  5. **Fulfillment & WMS:** Route-optimized serpentine batch picking, touch-friendly barcode packing station console, and shipping carrier pickup manifests.
  6. **Procurement & Supplier Operations:** End-to-end PO lifecycles, dock receiving console (GRN), 3-way invoice matching, and Return to Vendor (RTV).
  7. **Customer Relationship Management (CRM):** 360-degree customer ledgers, RFM automated segmentation (Champions, Loyalists, At Risk), and custom B2B pricing tiers.
  8. **Marketing & Promotional Engine:** Tiered cart rules, promotional coupon engine with usage limits, and multi-channel ROI attribution.
  9. **Finance, Accounting & General Ledger:** Automated GAAP P&L statements, payment processor fee reconciliations (Stripe/PayPal), Net-terms A/R aging, and bank statement matching.
  10. **Business Intelligence & Visual Analytics:** Product margin quadrant scatter plots, cohort repurchase heatmaps, and inventory DIO aging.
  11. **Administration, Security & Governance:** Granular Role-Based Access Control (RBAC), webhook integrations, and immutable UTC audit logging.

- **Enterprise Design System & Ergonomics:**
  - **The 20px Grid Rhythm (`--space-20`):** Standardized horizontal alignment across panel headers, toolbars, tables, and footers to eliminate visual scanning fatigue.
  - **Tabular Numerals (`font-feature-settings: "tnum" 1`):** Fixed-width numerical alignment across financial figures, stock levels, and SKUs.
  - **WCAG 2.1 AA/AAA Accessible Palette:** High-contrast semantic states (Forest Success, Amber Warning, Crimson Danger, Teal Info).
  - **Multi-Device Responsive Architecture:** Desktop Ultra (1600px), Tablet Workstation (768px–1279px, 64px icon rail), and Mobile Handheld (<768px off-canvas drawer).

---

## 📖 Comprehensive Documentation & Client Manual

- **Client Solution Specification & Architecture Manual (PDF):** [`CommerceOS_ERP_Manual.pdf`](CommerceOS_ERP_Manual.pdf)
- **Interactive HTML Documentation Preview:** [`CommerceOS_ERP_Manual.html`](CommerceOS_ERP_Manual.html)
- **Complete Markdown Functional Reference:** [`COMMERCEOS_ERP_DOCUMENTATION.md`](COMMERCEOS_ERP_DOCUMENTATION.md)

---

## 🛠️ Quickstart / Running the Prototype

To launch the local preview server for all 74 screens:

```bash
cd dashboard-preview
python3 serve.py
```

Then navigate to `http://localhost:8000/Main.dc.html` in your web browser.

---

## 📁 Repository Structure

```
ecommerceOS/
├── COMMERCEOS_ERP_DOCUMENTATION.md    # Master ERP documentation & workflows
├── CommerceOS_ERP_Manual.html          # Interactive HTML documentation
├── CommerceOS_ERP_Manual.pdf           # 17-page publication-grade PDF manual
├── README.md                           # Project overview & documentation
└── dashboard-preview/                  # 74 Production ERP screens & Design System
    ├── ds/commerceos/                  # Design System foundations & tokens
    │   ├── foundations/                # CSS custom properties & variables
    │   ├── components/                 # Component bundles
    │   └── shell/                      # List, shell, and visual layouts
    ├── Main.dc.html                    # Executive Command Dashboard
    ├── Orders.dc.html                  # Sales & Order Processing
    ├── Products.dc.html                # Catalog Management
    ├── InventoryOverview.dc.html       # Inventory Control
    ├── Picking.dc.html                 # WMS Batch Picking
    ├── Packing.dc.html                 # Packing Station Console
    ├── Shipping.dc.html                # Carrier Manifests
    ├── PurchaseOrders.dc.html          # Procurement POs
    ├── Customers.dc.html               # CRM & Accounts
    ├── FinanceOverview.dc.html         # General Ledger & P&L
    └── serve.py                        # Local preview server
```

---

## 🔒 Security & Governance

Built with enterprise-grade Role-Based Access Control (RBAC) across 5 access levels (Operations Lead, Warehouse Picker, Financial Controller, Customer Support, and System Admin) and an immutable UTC audit logging trail.
