const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ─── DATABASE CONFIGURATION ────────────────────────────────────────────
const DB_CONFIG = {
  SERVER: '115.124.124.5',           // e.g. '192.168.1.10' or 'DESKTOP-XYZ\\SQLEXPRESS'
  PORT: 4059,           // port goes here as a number
  DATABASE: 'TEMP_BI',         // e.g. 'CompanyDB'
  USERNAME: 'reader',         // e.g. 'sa'
  PASSWORD: 'ALSreader@2026',         // e.g. 'yourpassword'
};

// ─── TABLE & COLUMN MAPPING ────────────────────────────────────────────
const TABLE_CONFIG = {
  TABLE_NAME: 'CBM_T',         // Your master product table name, e.g. 'tblProducts'

  // Map each app field → the exact column name in your SQL table
  COL_PRODUCT_NAME: 'Material',  // Product name / description                  → DB: Material Name
  COL_LENGTH: 'L',  // Outer length of shipper box                                 → DB: L
  COL_WIDTH: 'W',  // Outer width of shipper box                                   → DB: W
  COL_HEIGHT: 'H',  // Outer height of shipper box                                 → DB: H
  // NOTE: All dimensions are in cm — no unit column needed.
  COL_PACKING_SIZE: 'PackSize',  // Pack size / variant label, e.g. '100ml', '1000ml'    → DB: Packing Size
  COL_PACK_QTY: '1packQty',  // Number of pieces per shipper (numeric)                   → DB: 1 Pack qnt.
  COL_NET_WEIGHT_PER_SHIPPER: 'Net_wet',  // Net weight of full shipper box (kg)         → DB: Net Wt.
  COL_GROSS_WEIGHT_PER_SHIPPER: 'Gross_wet',  // Gross weight of full shipper box (kg)     → DB: Gross Wt.
};
// ──────────────────────────────────────────────────────────────────────

const sqlConfig = {
  user: DB_CONFIG.USERNAME,
  password: DB_CONFIG.PASSWORD,
  server: DB_CONFIG.SERVER,
  port: DB_CONFIG.PORT,
  database: DB_CONFIG.DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

app.get('/api/products', async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const {
      TABLE_NAME,
      COL_PRODUCT_NAME,
      COL_LENGTH,
      COL_WIDTH,
      COL_HEIGHT,
      COL_PACKING_SIZE,
      COL_PACK_QTY,
      COL_NET_WEIGHT_PER_SHIPPER,
      COL_GROSS_WEIGHT_PER_SHIPPER
    } = TABLE_CONFIG;

    // Build SELECT columns dynamically, skipping any that haven't been configured yet
    const selectCols = [
      COL_PRODUCT_NAME,
      COL_LENGTH,
      COL_WIDTH,
      COL_HEIGHT,
      COL_PACKING_SIZE,
      COL_PACK_QTY,
      COL_NET_WEIGHT_PER_SHIPPER,
      COL_GROSS_WEIGHT_PER_SHIPPER,
    ]
      .filter(Boolean)
      .map(c => `[${c}]`)
      .join(', ');

    const tableRef = TABLE_NAME.includes('.')
      ? TABLE_NAME.split('.').map(p => `[${p}]`).join('.')
      : `[${TABLE_NAME}]`;
    const query = `SELECT ${selectCols} FROM ${tableRef}`;

    const result = await pool.request().query(query);

    const products = result.recordset.map(row => ({
      id: crypto.randomUUID(),
      name: row[COL_PRODUCT_NAME] || '',
      length: parseFloat(row[COL_LENGTH]) || 0,
      width: parseFloat(row[COL_WIDTH]) || 0,
      height: parseFloat(row[COL_HEIGHT]) || 0,
      unit: 'cm',  // All DB dimensions are in cm
      // packingString: text variant label from "Packing Size" column (e.g. "100ml", "1000ml")
      packingString: COL_PACKING_SIZE ? String(row[COL_PACKING_SIZE] || '').trim() : '',
      // packSize: numeric quantity per shipper from "1 Pack qnt." column
      packSize: parseInt(row[COL_PACK_QTY]) || 1,
      // netWeightPerShipper: net weight of the full shipper box from "Net Wt." column
      netWeightPerUnit: parseFloat(row[COL_NET_WEIGHT_PER_SHIPPER]) || 0,
      grossWeightPerShipper: parseFloat(row[COL_GROSS_WEIGHT_PER_SHIPPER]) || 0,
      icon: '💊',
      color: 'from-indigo-50 to-violet-50/60 dark:from-indigo-950/60 dark:to-violet-950/40',
      border: 'border-indigo-200 dark:border-indigo-700/60',
    }));

    res.json(products);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
