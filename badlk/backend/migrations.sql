CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT,
  email         TEXT UNIQUE,
  password_hash TEXT,
  phone         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  title       TEXT,
  description TEXT,
  category    TEXT,
  price       INTEGER,
  location    TEXT,
  photos      TEXT,
  reported    INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id          INTEGER,
  user_id        INTEGER,
  phone          TEXT,
  amount         INTEGER,
  provider       TEXT,
  status         TEXT,
  transaction_id TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
)
