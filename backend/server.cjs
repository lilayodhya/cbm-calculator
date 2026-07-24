const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const crypto = require('crypto');
const fs = require('node:fs');
const path = require('node:path');

// Load local development secrets from .env. On the office server, prefer
// setting these variables in the service account or secret manager instead.
const envFile = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const decryptSecret = (encryptedPayload, passphrase) => {
  const [ivHex, payloadHex] = encryptedPayload.split(':');
  if (!ivHex || !payloadHex) {
    throw new Error('Encrypted secret payload is invalid.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(payloadHex, 'hex');
  const key = crypto.scryptSync(passphrase, 'cbm-als-db-password-salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  const tagLength = 16;
  const ciphertext = encryptedBuffer.subarray(0, encryptedBuffer.length - tagLength);
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - tagLength);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};

const getDbPassword = () => {
  const encryptedPassword = process.env.DB_PASSWORD_ENCRYPTED?.trim();
  const passphrase = process.env.DB_PASSWORD_PASSPHRASE?.trim();

  if (encryptedPassword && passphrase) {
    try {
      return decryptSecret(encryptedPassword, passphrase);
    } catch (error) {
      console.error('Failed to decrypt DB_PASSWORD_ENCRYPTED:', error);
      throw error;
    }
  }

  return requiredEnv('DB_PASSWORD');
};

const app = express();
const allowedFrontendOrigins = requiredEnv('FRONTEND_ORIGIN')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header receive no CORS permission. This
      // supports non-browser health checks without exposing the API to sites.
      callback(null, Boolean(origin && allowedFrontendOrigins.includes(origin)));
    },
    methods: ['GET'],
    maxAge: 86400,
  })
);
app.use(express.json());

// ─── DATABASE CONFIGURATION ────────────────────────────────────────────
const DB_CONFIG = {
  SERVER: requiredEnv('DB_SERVER'),
  PORT: Number(process.env.DB_PORT || 1433),
  DATABASE: requiredEnv('DB_DATABASE'),
  USERNAME: requiredEnv('DB_USERNAME'),
  PASSWORD: getDbPassword(),
};

// Supply the PEM-encoded issuing CA certificate when SQL Server uses an
// internal PKI that is not already trusted by Node.js.
const dbCaCertificatePath = process.env.DB_CA_CERT_PATH?.trim();
const dbCaCertificate = dbCaCertificatePath
  ? fs.readFileSync(dbCaCertificatePath, 'utf8')
  : undefined;
const dbTrustServerCertificate =
  process.env.DB_TRUST_SERVER_CERTIFICATE?.trim().toLowerCase();
const shouldTrustServerCertificate = dbCaCertificate
  ? dbTrustServerCertificate === 'true'
  : dbTrustServerCertificate !== 'false';

if (!dbCaCertificate && shouldTrustServerCertificate) {
  console.warn(
    'DB_CA_CERT_PATH is not configured or the file is missing; falling back to trustServerCertificate for SQL connectivity.'
  );
}

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
    // Require TLS and validate the SQL Server certificate. DB_SERVER must
    // match the certificate's DNS name and the issuing CA must be trusted by
    // the office server running this application.
    encrypt: true,
    trustServerCertificate: shouldTrustServerCertificate,
    ...(dbCaCertificate && {
      cryptoCredentialsDetails: { ca: dbCaCertificate },
    }),
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
    res.status(500).json({ error: 'Unable to load products.' });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
