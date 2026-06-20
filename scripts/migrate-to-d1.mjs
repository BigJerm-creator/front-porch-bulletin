// Run with: node scripts/migrate-to-d1.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const downloadsDir = "C:\\Users\\User\\Downloads";
const outputFile = path.join(__dirname, "d1-seed.sql");

// Fix UTF-8 mojibake from Replit's JSON export
function fixEncoding(str) {
  if (typeof str !== "string") return str;
  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

function fixObj(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return fixEncoding(obj);
  if (Array.isArray(obj)) return obj.map(fixObj);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = fixObj(v);
    return out;
  }
  return obj;
}

function val(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insertRows(tableName, rows) {
  if (!rows || rows.length === 0) return `-- No rows for ${tableName}\n`;
  const cols = Object.keys(rows[0]);
  const lines = rows.map((row) => {
    const values = cols.map((c) => val(row[c])).join(", ");
    return `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${values});`;
  });
  return `-- ${tableName} (${rows.length} rows)\n` + lines.join("\n") + "\n";
}

function getTableName(keys) {
  const k = [...keys].sort().join(",");
  const maps = {
    "archived,author,category,content,created_at,featured,id,page2_featured,photo_credit,photo_url,photos,published_at,status,subtitle,title,updated_at": "articles",
    "description,id,name,show_in_events,slug": "categories",
    "created_at,description,event_date,event_time,id,location,title": "calendar_events",
    "address,created_at,id,name,pastor,phone,photo_credit,photo_url,photos,service_times,sort_order": "churches",
    "created_at,description,group_type,id,name,photo_credit,photo_url,photos,status,updated_at": "group_spotlight",
    "created_at,description,grade,id,name,photo_credit,photo_url,photos,school,status,updated_at": "student_spotlight",
    "email,id,name,subscribed_at": "newsletter_subscribers",
    "clerk_user_id,granted_at,id,role": "user_roles",
    "body,editorial_staff,founding_year,id,office_location,updated_at": "about_content",
    "caption,created_at,id,image_url,status,updated_at": "comics",
    "created_at,crossword_url,id,status,updated_at,word_search_url": "puzzles",
    "id,issue_month,issue_number,issue_year,updated_at": "issue_settings",
  };
  // business_spotlight has business_type but NOT group_type or grade
  if (k === "business_type,created_at,description,id,name,photo_credit,photo_url,photos,status,updated_at") {
    return "business_spotlight";
  }
  return maps[k] ?? null;
}

const files = fs.readdirSync(downloadsDir)
  .filter((f) => f.startsWith("drizzle-data-") && f.endsWith(".json"))
  .sort()
  .map((f) => path.join(downloadsDir, f));

const tableData = {};

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!raw || raw.length === 0) continue;
  const rows = raw.map(fixObj);
  const keys = Object.keys(rows[0]);
  const tableName = getTableName(keys);

  if (!tableName) {
    console.warn(`Could not identify: ${path.basename(file)} (keys: ${keys.sort().join(",")})`);
    continue;
  }

  // Skip duplicates — keep first occurrence
  if (tableData[tableName]) {
    console.log(`Skipping duplicate for ${tableName}: ${path.basename(file)}`);
    continue;
  }

  tableData[tableName] = rows;
  console.log(`✓ ${tableName} (${rows.length} rows) ← ${path.basename(file)}`);
}

// Add default issue_settings if missing
if (!tableData["issue_settings"]) {
  console.log("⚠ issue_settings not found in downloads — using default (Issue 02 / June 2026)");
  tableData["issue_settings"] = [{
    id: 1,
    issue_number: "02",
    issue_year: 2026,
    issue_month: 6,
    updated_at: new Date().toISOString(),
  }];
}

const schema = `
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  page2_featured INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  show_in_events INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS churches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  pastor TEXT NOT NULL,
  service_times TEXT NOT NULL,
  phone TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'approved_user',
  granted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  founding_year TEXT NOT NULL DEFAULT '1924',
  body TEXT NOT NULL DEFAULT '',
  editorial_staff TEXT NOT NULL DEFAULT '[]',
  office_location TEXT NOT NULL DEFAULT 'Main Street',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS issue_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_number TEXT NOT NULL DEFAULT '01',
  issue_year INTEGER NOT NULL DEFAULT 2026,
  issue_month INTEGER NOT NULL DEFAULT 5,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crossword_url TEXT,
  word_search_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const tableOrder = [
  "categories", "articles", "calendar_events", "churches",
  "business_spotlight", "group_spotlight", "student_spotlight",
  "newsletter_subscribers", "user_roles", "about_content",
  "issue_settings", "comics", "puzzles",
];

let sql = `-- D1 Seed File generated ${new Date().toISOString()}
-- Import with: npx wrangler d1 execute front-porch-bulletin-db --file=scripts/d1-seed.sql --remote

PRAGMA foreign_keys = OFF;
${schema}
`;

for (const table of tableOrder) {
  if (tableData[table]) {
    sql += insertRows(table, tableData[table]) + "\n";
  }
}

sql += `PRAGMA foreign_keys = ON;\n`;

fs.writeFileSync(outputFile, sql, "utf8");
console.log(`\n✓ Written to ${outputFile}`);
console.log(`Tables: ${Object.keys(tableData).join(", ")}`);
