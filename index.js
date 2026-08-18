// ===================================================================
// COMPLETE INDEX.JS – Webhook fix with debug + all modules
// ===================================================================

const { Telegraf } = require('telegraf');
const axios = require('axios');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const { initializeApp, getApps, getApp } = require('firebase/app');
const {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} = require('firebase/firestore');
const express = require('express');
require('dotenv').config();

// ------------------------- GLOBAL LOGGER ---------------------------
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ${level.toUpperCase()} - ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

// ===================================================================
// 1. CONFIGURATION (hardcoded from your fik_config.py)
// ===================================================================
const BOT_TOKEN = "8804113450:AAE3jFGAwcqvtQCS3hbLJjdwPlPgnsL3_3s";
const G2BULK_API_KEY = "e3c640d2c6a2b013f04d9ba4140aea95bf579a4b098a3e6979f594b8de624031";
const G2BULK_BASE_URL = "https://api.g2bulk.com/v1";

const ADMIN_USERNAME = "@Dev_LecteR";
const ADMIN_CHAT_ID = [8453713398, 8636992436, 6153912689];

const UPDATES_CHANNEL = "@Exynosshop";
const SUPPORT_WEBSITE = "";

const TELEBIRR_PHONE = "0927172626";
const MIN_DEPOSIT_BIRR = 50;
const MIN_WITHDRAW_BIRR = 100;

const VERIFY_API_BASE_URL = "https://verifyapi.leulzenebe.pro";
const VERIFY_API_KEY = "sk_live_d82a6778a32490185e6eed0fbc2a00da0be3fe2467a4d8d3";
const EXPECTED_RECEIVER_NAME = "Weldesemayat";

const CACHE_TTL = 600;
const DB_PATH = "bot_database.db";
const PROOF_CHANNEL_ID = -1004442339437;
const REPORT_CHANNEL_ID = PROOF_CHANNEL_ID;

const CBE_PHONE = "1000000192914";
const CBE_RECEIVER_NAME = "Ferehiwot";
const EXCHANGE_RATE = 1.0;

// Webhook config
const WEBHOOK_PATH = "/webhook";
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;
if (!PUBLIC_URL) {
  logger.error("❌ No PUBLIC_URL or RENDER_EXTERNAL_URL set. Cannot set webhook.");
  process.exit(1);
}
const WEBHOOK_URL = `${PUBLIC_URL}${WEBHOOK_PATH}`;

// ===================================================================
// 2. EMOJIS & CUSTOM EMOJI IDs
// ===================================================================
const ID_CHECK = "5382350120815713040";
const ID_CROSS = "5240241223632954241";
const ID_CONFIRM = "5857044938755149915";
const ID_CANCEL = "5240241223632954241";
const ID_BACK = "5391090636961099009";
const ID_DEPOSIT = "5224641412787630992";
const ID_WITHDRAW = "5987880246865565644";
const ID_PROFILE = "5904630315946611415";
const ID_ORDER = "5258024802010026053";
const ID_HELP = "6305243923056954377";
const ID_HOME = "5920332557466997677";
const ID_STAR = "5954135079662916434";
const ID_PREMIUM = "5789440723292000849";
const ID_TELEBIRR = "5796366529855494419";
const ID_CBE = "5961054379350955385";
const ID_GAME = "6170064612008924065";
const ID_MORE = "5397916757333654639";
const ID_SUPPORT = "6028346797368283073";
const ID_WALLET = "5769126056262898415";
const ID_SUCCESS = "6170055790146098906";
const ID_FAIL = "5260293700088511294";
const ID_INFO = "5936017305585586269";
const ID_WARNING = "5447644880824181073";
const ID_USER = "5920052658743283381";
const ID_CALENDAR = "5039534051816375152";
const ID_MONEY = "5224257782013769471";
const ID_SETTINGS = ID_INFO;
const ID_MEGAPHONE = ID_MORE;
const ID_ADD = ID_MORE;
const ID_LIST = ID_ORDER;
const ID_DELETE = ID_CANCEL;
const ID_TOGGLE = ID_INFO;
const ID_BAN = ID_CROSS;
const ID_UNBAN = ID_CHECK;
const ID_SEARCH = ID_ORDER;
const ID_CLOCK = ID_CALENDAR;
const ID_MAIL = ID_SUPPORT;

function emoji_tag(emoji_id, fallback) {
  return `<tg-emoji emoji-id="${emoji_id}">${fallback}</tg-emoji>`;
}

const EMOJI_CHECK = emoji_tag(ID_CHECK, "✅");
const EMOJI_CROSS = emoji_tag(ID_CROSS, "❌");
const EMOJI_CONFIRM = emoji_tag(ID_CONFIRM, "✔️");
const EMOJI_CANCEL = emoji_tag(ID_CANCEL, "✖️");
const EMOJI_BACK = emoji_tag(ID_BACK, "🔙");
const EMOJI_DEPOSIT = emoji_tag(ID_DEPOSIT, "💰");
const EMOJI_WITHDRAW = emoji_tag(ID_WITHDRAW, "💸");
const EMOJI_PROFILE = emoji_tag(ID_PROFILE, "👤");
const EMOJI_ORDER = emoji_tag(ID_ORDER, "📦");
const EMOJI_HELP = emoji_tag(ID_HELP, "❓");
const EMOJI_HOME = emoji_tag(ID_HOME, "🏠");
const EMOJI_STAR = emoji_tag(ID_STAR, "⭐");
const EMOJI_PREMIUM = emoji_tag(ID_PREMIUM, "💎");
const EMOJI_TELEBIRR = emoji_tag(ID_TELEBIRR, "📱");
const EMOJI_CBE = emoji_tag(ID_CBE, "🏦");
const EMOJI_GAME = emoji_tag(ID_GAME, "🎮");
const EMOJI_MORE = emoji_tag(ID_MORE, "➕");
const EMOJI_SUPPORT = emoji_tag(ID_SUPPORT, "💬");
const EMOJI_WALLET = emoji_tag(ID_WALLET, "👛");
const EMOJI_SUCCESS = emoji_tag(ID_SUCCESS, "✅");
const EMOJI_FAIL = emoji_tag(ID_FAIL, "❌");
const EMOJI_INFO = emoji_tag(ID_INFO, "ℹ️");
const EMOJI_WARNING = emoji_tag(ID_WARNING, "⚠️");
const EMOJI_USER = emoji_tag(ID_USER, "👤");
const EMOJI_CALENDAR = emoji_tag(ID_CALENDAR, "📅");
const EMOJI_MONEY = emoji_tag(ID_MONEY, "💵");
const EMOJI_BAN = emoji_tag(ID_BAN, "🚫");
const EMOJI_UNBAN = emoji_tag(ID_UNBAN, "✅");
const EMOJI_TOGGLE = emoji_tag(ID_TOGGLE, "🔄");
const EMOJI_SETTINGS = emoji_tag(ID_SETTINGS, "⚙️");
const EMOJI_MEGAPHONE = emoji_tag(ID_MEGAPHONE, "📢");
const EMOJI_ADD = emoji_tag(ID_ADD, "➕");
const EMOJI_LIST = emoji_tag(ID_LIST, "📋");
const EMOJI_DELETE = emoji_tag(ID_DELETE, "🗑️");
const EMOJI_CLOCK = emoji_tag(ID_CLOCK, "⏰");
const EMOJI_MAIL = emoji_tag(ID_MAIL, "📧");
const EMOJI_SEARCH = emoji_tag(ID_SEARCH, "🔍");

// ===================================================================
// 3. UTILITY FUNCTIONS
// ===================================================================
function api_price_to_birr(api_price, markup_amount = 0.0) {
  return api_price * EXCHANGE_RATE + markup_amount;
}

function parse_amount(s) {
  if (!s || typeof s !== 'string') return null;
  const clean = s.trim().toLowerCase().replace(/,/g, '');
  if (clean.endsWith('k')) {
    const val = parseFloat(clean.slice(0, -1));
    return isNaN(val) ? null : Math.floor(val * 1000);
  }
  const val = parseFloat(clean);
  return isNaN(val) ? null : Math.floor(val);
}

function parse_telegram_name(name) {
  if (!name || typeof name !== 'string') return null;
  const s = name.toLowerCase().trim();
  const starsMatch = s.match(/(\S+)\s*stars?/);
  if (starsMatch) {
    const amount = parse_amount(starsMatch[1]);
    if (amount !== null) return ["stars", amount];
  }
  const premiumMatch = s.match(/(\S+)\s*(?:months?|month|year|yr)\s*premium/);
  if (premiumMatch) {
    let amount = parse_amount(premiumMatch[1]);
    if (amount !== null) {
      if (s.includes('year') || s.includes('yr')) amount *= 12;
      return ["premium", amount];
    }
  }
  return null;
}

function format_telegram_display(name, birr_price) {
  const parsed = parse_telegram_name(name);
  if (parsed) {
    const [type, amount] = parsed;
    if (type === "stars") return `${amount} stars - ${Math.floor(birr_price)}ETB`;
    if (type === "premium") return `${amount} Months premium - ${Math.floor(birr_price)}ETB`;
  }
  return `${name} - ${Math.floor(birr_price)}ETB`;
}

function get_clean_telegram_name(name) {
  const parsed = parse_telegram_name(name);
  if (parsed) {
    const [type, amount] = parsed;
    if (type === "stars") return `${amount} stars`;
    if (type === "premium") return `${amount} Months premium`;
  }
  return name;
}

function extract_last4(account) {
  if (!account) return "";
  const digits = String(account).replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : digits;
}

function format_deposit_id(dep_id) {
  const num = parseInt(dep_id, 10);
  return `EX${num + 100}`;
}

function format_withdrawal_id(wth_id) {
  const str = String(wth_id);
  if (str.startsWith("WTH-")) return str;
  if (/^\d+$/.test(str)) return `EX${parseInt(str, 10) + 200}`;
  return str;
}

function parse_formatted_id(formatted) {
  if (!formatted) return null;
  const match = formatted.trim().toUpperCase().match(/^EX(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (num >= 101 && num <= 199) return String(num - 100);
  if (num >= 201 && num <= 299) return String(num - 200);
  return null;
}

function generate_withdrawal_id() {
  const random_part = Array.from({ length: 8 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
  const numeric_part = String(Math.floor(Date.now()) % 10000);
  return `WTH-${random_part}-${numeric_part}`;
}

// ===================================================================
// 4. KEYBOARDS
// ===================================================================
function get_main_inline_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Profile", callback_data: "menu_profile", icon_custom_emoji_id: ID_PROFILE, style: "primary" },
        { text: "Service", callback_data: "menu_service", icon_custom_emoji_id: ID_GAME, style: "success" }
      ],
      [{ text: "Deposit", callback_data: "menu_deposit", icon_custom_emoji_id: ID_DEPOSIT, style: "success" }],
      [
        { text: "My Orders", callback_data: "menu_orders", icon_custom_emoji_id: ID_ORDER, style: "primary" },
        { text: "Withdraw", callback_data: "menu_withdraw", icon_custom_emoji_id: ID_WITHDRAW, style: "danger" }
      ],
      [{ text: "Support", callback_data: "menu_support", icon_custom_emoji_id: ID_SUPPORT, style: "primary" }]
    ]
  };
}

function get_profile_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "My Profile", callback_data: "profile_show", icon_custom_emoji_id: ID_PROFILE, style: "primary" },
        { text: "Referral", callback_data: "profile_referral", icon_custom_emoji_id: ID_USER, style: "primary" }
      ],
      [{ text: "Redeem", callback_data: "profile_redeem", icon_custom_emoji_id: ID_MONEY, style: "primary" }],
      [{ text: "Back to Main", callback_data: "back_to_main", icon_custom_emoji_id: ID_BACK, style: "danger" }]
    ]
  };
}

function get_service_inline_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Telegram Stars", callback_data: "svc_telegram_stars", icon_custom_emoji_id: ID_STAR, style: "primary" }],
      [{ text: "Telegram Premium", callback_data: "svc_telegram_premium", icon_custom_emoji_id: ID_PREMIUM, style: "primary" }],
      [{ text: "Back to main menu", callback_data: "back_to_main", icon_custom_emoji_id: ID_BACK, style: "danger" }]
    ]
  };
}

function get_confirmation_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Confirm", callback_data: "order_confirm", icon_custom_emoji_id: ID_CONFIRM, style: "success" },
        { text: "Cancel", callback_data: "order_cancel", icon_custom_emoji_id: ID_CANCEL, style: "danger" }
      ],
      [{ text: "Back", callback_data: "order_back", icon_custom_emoji_id: ID_BACK, style: "danger" }]
    ]
  };
}

function get_deposit_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Telebirr (ETB)", callback_data: "dep_method:telebirr", icon_custom_emoji_id: ID_TELEBIRR, style: "primary" },
        { text: "CBE (ETB)", callback_data: "dep_method:cbe", icon_custom_emoji_id: ID_CBE, style: "primary" }
      ],
      [{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]
    ]
  };
}

function get_withdraw_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Telebirr (ETB)", callback_data: "withdraw_method:telebirr", icon_custom_emoji_id: ID_TELEBIRR, style: "primary" }],
      [{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]
    ]
  };
}

function get_support_keyboard() {
  const admin_url = `https://t.me/${ADMIN_USERNAME.replace('@', '')}`;
  const channel_url = `https://t.me/${UPDATES_CHANNEL.replace('@', '')}`;
  const keyboard = [
    [
      { text: "Contact Admin", url: admin_url, icon_custom_emoji_id: ID_SUPPORT, style: "primary" },
      { text: "Updates Channel", url: channel_url, icon_custom_emoji_id: ID_SUPPORT, style: "primary" }
    ]
  ];
  if (SUPPORT_WEBSITE) {
    keyboard.push([{ text: "Visit Website", url: SUPPORT_WEBSITE, icon_custom_emoji_id: ID_INFO, style: "primary" }]);
  }
  keyboard.push([{ text: "Back to main menu", callback_data: "back_to_main", icon_custom_emoji_id: ID_BACK, style: "danger" }]);
  return { inline_keyboard: keyboard };
}

function get_admin_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Dashboard", callback_data: "admin_dashboard", icon_custom_emoji_id: ID_INFO }],
      [{ text: "Pending Deposits", callback_data: "admin_deposits", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Pending Withdrawals", callback_data: "admin_withdrawals", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Promo Codes", callback_data: "admin_promo", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Referral Lookup", callback_data: "admin_referral", icon_custom_emoji_id: ID_USER }],
      [{ text: "Search by ID", callback_data: "admin_search_by_id", icon_custom_emoji_id: ID_SEARCH }],
      [{ text: "Settings & Tools", callback_data: "admin_settings", icon_custom_emoji_id: ID_SETTINGS }],
      [{ text: "Broadcast", callback_data: "admin_broadcast", icon_custom_emoji_id: ID_MEGAPHONE }],
      [{ text: "Close", callback_data: "admin_close", icon_custom_emoji_id: ID_CANCEL }]
    ]
  };
}

function get_admin_promo_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Create Code", callback_data: "admin_promo_create", icon_custom_emoji_id: ID_ADD }],
      [{ text: "List Codes", callback_data: "admin_promo_list", icon_custom_emoji_id: ID_LIST }],
      [{ text: "Delete Code", callback_data: "admin_promo_delete", icon_custom_emoji_id: ID_DELETE }],
      [{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]
    ]
  };
}

function get_admin_settings_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "User Management", callback_data: "admin_user_manage", icon_custom_emoji_id: ID_USER }],
      [{ text: "Telegram Stars Markup", callback_data: "admin_stars_markup", icon_custom_emoji_id: ID_STAR }],
      [{ text: "Telegram Premium Markup", callback_data: "admin_premium_markup", icon_custom_emoji_id: ID_PREMIUM }],
      [{ text: "Set Product Price", callback_data: "admin_set_product_price", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Toggle Maintenance", callback_data: "admin_toggle_maintenance", icon_custom_emoji_id: ID_TOGGLE }],
      [{ text: "Toggle Reports", callback_data: "admin_toggle_reports", icon_custom_emoji_id: ID_TOGGLE }],
      [{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]
    ]
  };
}

function get_user_manage_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Ban User", callback_data: "admin_ban", icon_custom_emoji_id: ID_BAN }],
      [{ text: "Unban User", callback_data: "admin_unban", icon_custom_emoji_id: ID_UNBAN }],
      [{ text: "Set Balance", callback_data: "admin_set_balance", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Back", callback_data: "admin_settings", icon_custom_emoji_id: ID_BACK }]
    ]
  };
}

function get_search_by_id_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Order", callback_data: "admin_search_id:order", icon_custom_emoji_id: ID_ORDER }],
      [{ text: "Deposit", callback_data: "admin_search_id:deposit", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Withdrawal", callback_data: "admin_search_id:withdrawal", icon_custom_emoji_id: ID_MONEY }],
      [{ text: "Back", callback_data: "admin_search_by_id", icon_custom_emoji_id: ID_BACK }]
    ]
  };
}

// ===================================================================
// 5. G2BULK API CLIENT
// ===================================================================
class G2BulkAPIClient {
  constructor(base_url, api_key, cache_ttl = 600) {
    this.base_url = (base_url || "").replace(/\/+$/, '');
    this.api_key = api_key;
    this.cache_ttl = cache_ttl;
    this._cache = new Map();
  }

  _get_headers(requires_auth = true) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (requires_auth) headers['X-API-Key'] = this.api_key;
    return headers;
  }

  _get_cached(key) {
    if (this._cache.has(key)) {
      const { data, expiry } = this._cache.get(key);
      if (Date.now() / 1000 < expiry) return data;
      this._cache.delete(key);
    }
    return null;
  }

  _set_cached(key, data) {
    this._cache.set(key, { data, expiry: Date.now() / 1000 + this.cache_ttl });
  }

  clear_cache() { this._cache.clear(); }

  async _request(method, endpoint, requires_auth = true, params = null, json_data = null, retries = 3) {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const url = `${this.base_url}/${cleanEndpoint}`;
    const headers = this._get_headers(requires_auth);
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const config = { method, url, headers, params, data: json_data, timeout: 15000 };
        const resp = await axios(config);
        if (resp.status === 429) {
          const wait = Math.pow(2, attempt) + 1;
          await new Promise(r => setTimeout(r, wait * 1000));
          continue;
        }
        if (resp.status === 401) return { success: false, message: "Unauthorized API access." };
        if (![200, 201, 202].includes(resp.status)) {
          let msg = `HTTP ${resp.status}`;
          if (resp.data && typeof resp.data === 'object') msg = resp.data.message || resp.data.error || msg;
          return { success: false, message: msg };
        }
        if (!resp.data) return { success: false, message: "Empty response from API." };
        return typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
      } catch (e) {
        if (e.response) {
          if (e.response.status === 429) continue;
          if (e.response.status === 401) return { success: false, message: "Unauthorized API access." };
          const msg = (e.response.data && (e.response.data.message || e.response.data.error)) || `HTTP status code ${e.response.status}`;
          return { success: false, message: msg };
        }
        if (attempt === retries - 1) return { success: false, message: `Network Error: ${e.message}` };
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    return { success: false, message: "Failed to resolve API connection." };
  }

  async get_me() { return await this._request("GET", "getMe", true); }
  async get_games() {
    const cache_key = "api_games_list";
    const cached = this._get_cached(cache_key);
    if (cached) return cached;
    const res = await this._request("GET", "games", false);
    if (res && res.success) this._set_cached(cache_key, res);
    return res;
  }
  async check_player_id(game_code, player_id) {
    return await this._request("POST", "games/checkPlayerId", true, null, { game: game_code, user_id: player_id });
  }
  async get_game_catalogue(game_code) {
    const cache_key = `api_catalogue_${game_code}`;
    const cached = this._get_cached(cache_key);
    if (cached) return cached;
    const res = await this._request("GET", `games/${game_code}/catalogue`, false);
    if (res && res.success) this._set_cached(cache_key, res);
    return res;
  }
  async place_order(game_code, catalogue_name, player_id, idempotency_key = null) {
    const payload = { catalogue_name, player_id };
    const endpoint = `games/${game_code}/order`;
    const headers = this._get_headers(true);
    if (idempotency_key) headers["X-Idempotency-Key"] = idempotency_key;
    try {
      const resp = await axios.post(`${this.base_url}/${endpoint}`, payload, { headers, timeout: 25000 });
      return resp.data;
    } catch (e) {
      if (e.response && e.response.data) return e.response.data;
      return { success: false, message: e.message };
    }
  }
  async purchase_product(product_id, quantity = 1, idempotency_key = null, recipient = null) {
    const payload = { quantity };
    if (recipient) {
      if (recipient.user_id) { payload.user_id = recipient.user_id; payload.telegram_id = recipient.user_id; }
      if (recipient.username) {
        const uname = recipient.username.replace(/^@/, '');
        payload.username = uname;
        payload.telegram_username = uname;
      }
    }
    const endpoint = `products/${product_id}/purchase`;
    const headers = this._get_headers(true);
    if (idempotency_key) headers["X-Idempotency-Key"] = idempotency_key;
    try {
      const resp = await axios.post(`${this.base_url}/${endpoint}`, payload, { headers, timeout: 25000 });
      return resp.data;
    } catch (e) {
      if (e.response && e.response.data) return e.response.data;
      return { success: false, message: e.message };
    }
  }
  async get_all_products() {
    const cache_key = "api_all_products";
    const cached = this._get_cached(cache_key);
    if (cached) return cached;
    const res = await this._request("GET", "products", false);
    if (res && res.success) this._set_cached(cache_key, res);
    return res;
  }
}

// ===================================================================
// 6. FIRESTORE DATABASE
// ===================================================================
class FirestoreDatabase {
  constructor() {
    this.project_id = process.env.FIREBASE_PROJECT_ID || "calcium-medium-1zp2g";
    this.database_id = process.env.FIREBASE_DATABASE_ID || "ai-studio-remixuntitled-f88a34da-8ff4-4244-ac0c-da9284afc9f5";
    this.api_key = process.env.FIREBASE_API_KEY || "AIzaSyBLNq9vnIB_K5YJhWnaGiSy6KXOzXto_mk";

    const firebaseConfig = { apiKey: this.api_key, projectId: this.project_id };
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = this.database_id ? getFirestore(app, this.database_id) : getFirestore(app);
    logger.info(`Firestore SDK initialized for project ${this.project_id} (database: ${this.database_id || "(default)"})`);
  }

  // ---------- Users ----------
  async add_user(telegram_id, username, first_name) {
    try {
      const userRef = doc(this.db, "users", String(telegram_id));
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          telegram_id: String(telegram_id),
          username: username || "",
          first_name: first_name || "",
          balance: 0.0,
          referral_balance: 0.0,
          banned: 0,
          daily_order_count: 0,
          last_order_date: "",
          registered_at: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, { username: username || "", first_name: first_name || "" }, { merge: true });
      }
    } catch (e) {
      logger.error(`Error in add_user: ${e.message}`);
    }
  }

  async get_user(telegram_id) {
    try {
      const userRef = doc(this.db, "users", String(telegram_id));
      const snap = await getDoc(userRef);
      if (snap.exists()) return snap.data() || {};
      return {};
    } catch (e) {
      logger.error(`Error in get_user: ${e.message}`);
      return {};
    }
  }

  async ban_user(telegram_id) {
    try {
      const userRef = doc(this.db, "users", String(telegram_id));
      await setDoc(userRef, { banned: 1 }, { merge: true });
    } catch (e) { logger.error(`Error in ban_user: ${e.message}`); }
  }

  async unban_user(telegram_id) {
    try {
      const userRef = doc(this.db, "users", String(telegram_id));
      await setDoc(userRef, { banned: 0 }, { merge: true });
    } catch (e) { logger.error(`Error in unban_user: ${e.message}`); }
  }

  async is_banned(telegram_id) {
    const user = await this.get_user(telegram_id);
    return String(user.banned) === "1" || user.banned === 1;
  }

  async set_balance(telegram_id, amount) {
    try {
      const userRef = doc(this.db, "users", String(telegram_id));
      await setDoc(userRef, { balance: parseFloat(amount) }, { merge: true });
    } catch (e) { logger.error(`Error in set_balance: ${e.message}`); }
  }

  async get_all_users() {
    try {
      const snap = await getDocs(collection(this.db, "users"));
      const users = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && String(data.banned) !== "1" && data.banned !== 1) {
          const uid = parseInt(docSnap.id, 10);
          if (!isNaN(uid)) users.push(uid);
        }
      });
      return users;
    } catch (e) {
      logger.error(`Error in get_all_users: ${e.message}`);
      return [];
    }
  }

  async update_balance(telegram_id, amount) {
    const user = await this.get_user(telegram_id);
    const current = parseFloat(user.balance || 0.0);
    const new_bal = current + parseFloat(amount);
    await this.set_balance(telegram_id, new_bal);
  }

  async get_referral_balance(telegram_id) {
    const user = await this.get_user(telegram_id);
    return parseFloat(user.referral_balance || 0.0);
  }

  async update_referral_balance(telegram_id, amount) {
    try {
      const user = await this.get_user(telegram_id);
      const current = parseFloat(user.referral_balance || 0.0);
      const new_bal = current + parseFloat(amount);
      const userRef = doc(this.db, "users", String(telegram_id));
      await setDoc(userRef, { referral_balance: parseFloat(new_bal) }, { merge: true });
    } catch (e) { logger.error(`Error in update_referral_balance: ${e.message}`); }
  }

  async can_place_order(user_id, max_daily_orders = 50) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await this.get_user(user_id);
    if (!user || !Object.keys(user).length) return true;
    const last_date = user.last_order_date || "";
    if (last_date !== today) {
      const userRef = doc(this.db, "users", String(user_id));
      await setDoc(userRef, { daily_order_count: 0, last_order_date: today }, { merge: true });
      return true;
    }
    return parseInt(user.daily_order_count || 0, 10) < max_daily_orders;
  }

  async increment_order_count(user_id) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const user = await this.get_user(user_id);
      const count = parseInt(user.daily_order_count || 0, 10) + 1;
      const userRef = doc(this.db, "users", String(user_id));
      await setDoc(userRef, { daily_order_count: count, last_order_date: today }, { merge: true });
    } catch (e) { logger.error(`Error in increment_order_count: ${e.message}`); }
  }

  async get_username(telegram_id) {
    const user = await this.get_user(telegram_id);
    return user.username || null;
  }

  async get_user_profile(telegram_id) {
    const user = await this.get_user(telegram_id);
    if (!user || !Object.keys(user).length) return {};
    const orders = await this.get_user_orders(telegram_id, 100);
    const total_orders = orders.length;
    const total_spent = orders.reduce((acc, o) => acc + parseFloat(o.charged_price || 0.0), 0.0);
    return {
      telegram_id: parseInt(user.telegram_id || telegram_id, 10),
      username: user.username,
      first_name: user.first_name,
      balance: parseFloat(user.balance || 0.0),
      referral_balance: parseFloat(user.referral_balance || 0.0),
      banned: parseInt(user.banned || 0, 10),
      registered_at: user.registered_at,
      total_orders,
      total_spent
    };
  }

  // ---------- Deposits ----------
  async create_deposit(user_id, method, amount, currency, proof_file_id) {
    try {
      const docRef = await addDoc(collection(this.db, "deposits"), {
        user_id: String(user_id),
        method: String(method),
        amount: parseFloat(amount),
        currency: String(currency),
        proof_file_id: proof_file_id || "",
        status: "pending",
        admin_note: "",
        created_at: new Date().toISOString(),
        resolved_at: "",
        balance_added: "false",
        user_notified: "false"
      });
      return docRef.id;
    } catch (e) {
      logger.error(`Error in create_deposit: ${e.message}`);
      return "0";
    }
  }

  async get_pending_deposits() {
    try {
      const q = query(collection(this.db, "deposits"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      const pending = [];
      snap.forEach(docSnap => pending.push({ id: docSnap.id, ...docSnap.data() }));
      return pending;
    } catch (e) {
      logger.error(`Error in get_pending_deposits: ${e.message}`);
      return [];
    }
  }

  async get_deposit_by_id(deposit_id) {
    try {
      const snap = await getDoc(doc(this.db, "deposits", String(deposit_id)));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      return {};
    } catch (e) {
      logger.error(`Error in get_deposit_by_id: ${e.message}`);
      return {};
    }
  }

  async approve_deposit(deposit_id, admin_note = "") {
    try {
      const deposit = await this.get_deposit_by_id(deposit_id);
      if (!deposit || deposit.status !== "pending") return false;
      const depRef = doc(this.db, "deposits", String(deposit_id));
      await updateDoc(depRef, {
        status: "approved",
        admin_note: admin_note || deposit.admin_note || "",
        resolved_at: new Date().toISOString(),
        balance_added: "true",
        user_notified: "true"
      });
      await this.update_balance(parseInt(deposit.user_id, 10), parseFloat(deposit.amount));
      return true;
    } catch (e) {
      logger.error(`Error in approve_deposit: ${e.message}`);
      return false;
    }
  }

  async reject_deposit(deposit_id, reason = "") {
    try {
      const deposit = await this.get_deposit_by_id(deposit_id);
      if (!deposit || deposit.status !== "pending") return false;
      const depRef = doc(this.db, "deposits", String(deposit_id));
      await updateDoc(depRef, {
        status: "rejected",
        admin_note: reason || deposit.admin_note || "",
        resolved_at: new Date().toISOString(),
        user_notified: "true"
      });
      return true;
    } catch (e) {
      logger.error(`Error in reject_deposit: ${e.message}`);
      return false;
    }
  }

  // ---------- Withdrawals ----------
  async create_withdrawal(user_id, method, amount, currency, account, nickname, fee = 0) {
    const random_part = Array.from({ length: 8 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
    const numeric_part = String(Math.floor(Date.now()) % 10000);
    const withdrawal_id = `WTH-${random_part}-${numeric_part}`;
    try {
      const wthRef = doc(this.db, "withdrawals", withdrawal_id);
      await setDoc(wthRef, {
        user_id: String(user_id),
        method: String(method),
        amount: Math.floor(amount),
        currency: String(currency),
        account: String(account),
        nickname: String(nickname),
        fee: Math.floor(fee),
        status: "PENDING",
        admin_note: "",
        admin_notified: "false",
        user_notified: "false",
        refunded: "false",
        created_at: new Date().toISOString(),
        resolved_at: ""
      });
      await this.update_balance(user_id, -amount);
      return withdrawal_id;
    } catch (e) {
      logger.error(`Error in create_withdrawal: ${e.message}`);
      return withdrawal_id;
    }
  }

  async get_pending_withdrawals() {
    try {
      const snap = await getDocs(collection(this.db, "withdrawals"));
      const pending = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (data.status || "").toUpperCase() === "PENDING") pending.push({ id: docSnap.id, ...data });
      });
      return pending;
    } catch (e) {
      logger.error(`Error in get_pending_withdrawals: ${e.message}`);
      return [];
    }
  }

  async get_withdrawal_by_id(withdrawal_id) {
    try {
      const snap = await getDoc(doc(this.db, "withdrawals", String(withdrawal_id)));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      return {};
    } catch (e) {
      logger.error(`Error in get_withdrawal_by_id: ${e.message}`);
      return {};
    }
  }

  async approve_withdrawal(withdrawal_id, admin_note = "", admin_id = null) {
    try {
      const w = await this.get_withdrawal_by_id(withdrawal_id);
      if (!w || (w.status || "").toUpperCase() !== "PENDING") return false;
      const wthRef = doc(this.db, "withdrawals", String(withdrawal_id));
      const payload = {
        status: "APPROVED",
        admin_note: admin_note || w.admin_note || "",
        resolved_at: new Date().toISOString(),
        user_notified: "true"
      };
      if (admin_id) payload.admin_id = String(admin_id);
      await updateDoc(wthRef, payload);
      return true;
    } catch (e) {
      logger.error(`Error in approve_withdrawal: ${e.message}`);
      return false;
    }
  }

  async reject_withdrawal(withdrawal_id, reason = "", admin_id = null) {
    try {
      const w = await this.get_withdrawal_by_id(withdrawal_id);
      if (!w || (w.status || "").toUpperCase() !== "PENDING") return false;
      const wthRef = doc(this.db, "withdrawals", String(withdrawal_id));
      const payload = {
        status: "REJECTED",
        admin_note: reason || w.admin_note || "",
        resolved_at: new Date().toISOString(),
        user_notified: "true",
        refunded: "true"
      };
      if (admin_id) payload.admin_id = String(admin_id);
      await updateDoc(wthRef, payload);
      await this.update_balance(parseInt(w.user_id, 10), parseFloat(w.amount));
      return true;
    } catch (e) {
      logger.error(`Error in reject_withdrawal: ${e.message}`);
      return false;
    }
  }

  // ---------- Orders ----------
  async create_order(telegram_id, order_id, status, game, service, player_id, nickname, package_name, api_price, charged_price, markup, api_response) {
    try {
      const orderRef = doc(this.db, "orders", String(order_id));
      await setDoc(orderRef, {
        telegram_id: String(telegram_id),
        order_id: String(order_id),
        status: String(status),
        game: String(game),
        service: String(service),
        player_id: String(player_id),
        nickname: String(nickname),
        package_name: String(package_name),
        api_price: parseFloat(api_price),
        charged_price: parseFloat(charged_price),
        markup_percent: parseFloat(markup),
        api_response: String(api_response),
        created_at: new Date().toISOString()
      });
    } catch (e) {
      logger.error(`Error in create_order: ${e.message}`);
    }
  }

  async get_user_orders(telegram_id, limitCount = 5) {
    try {
      const q = query(collection(this.db, "orders"), where("telegram_id", "==", String(telegram_id)));
      const snap = await getDocs(q);
      const orders = [];
      snap.forEach(docSnap => orders.push({ id: docSnap.id, ...docSnap.data() }));
      orders.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      return orders.slice(0, limitCount);
    } catch (e) {
      logger.error(`Error in get_user_orders: ${e.message}`);
      return [];
    }
  }

  async get_order_by_id(order_id) {
    try {
      const snap = await getDoc(doc(this.db, "orders", String(order_id)));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      const q = query(collection(this.db, "orders"), where("order_id", "==", String(order_id)));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const first = qSnap.docs[0];
        return { id: first.id, ...first.data() };
      }
      return null;
    } catch (e) {
      logger.error(`Error in get_order_by_id: ${e.message}`);
      return null;
    }
  }

  async get_order_by_numeric_id(numeric_id) {
    return await this.get_order_by_id(numeric_id);
  }

  // ---------- Referrals ----------
  async create_referral(referrer_id, referred_id, referral_reward = 2.0) {
    try {
      const refRef = doc(this.db, "referrals", String(referred_id));
      const snap = await getDoc(refRef);
      if (snap.exists()) return false;
      const nowIso = new Date().toISOString();
      await setDoc(refRef, {
        referrer_id: String(referrer_id),
        referred_id: String(referred_id),
        status: "completed",
        reward_given: 1,
        reward_amount: parseFloat(referral_reward),
        created_at: nowIso,
        rewarded_at: nowIso
      });
      await this.update_balance(referrer_id, referral_reward);
      await this.update_referral_balance(referrer_id, referral_reward);
      return true;
    } catch (e) {
      logger.error(`Error in create_referral: ${e.message}`);
      return false;
    }
  }

  async get_referral_stats(user_id) {
    try {
      const q = query(collection(this.db, "referrals"), where("referrer_id", "==", String(user_id)));
      const snap = await getDocs(q);
      let total = 0, rewarded = 0, total_reward = 0.0;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        total += 1;
        if (String(data.reward_given) === "1" || data.reward_given === 1) {
          rewarded += 1;
          total_reward += parseFloat(data.reward_amount || 0.0);
        }
      });
      return [total, rewarded, total_reward];
    } catch (e) {
      logger.error(`Error in get_referral_stats: ${e.message}`);
      return [0, 0, 0.0];
    }
  }

  async get_referral_list(user_id, limitCount = 20) {
    try {
      const q = query(collection(this.db, "referrals"), where("referrer_id", "==", String(user_id)));
      const snap = await getDocs(q);
      const refs = [];
      snap.forEach(docSnap => refs.push({ id: docSnap.id, ...docSnap.data() }));
      refs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      return refs.slice(0, limitCount);
    } catch (e) {
      logger.error(`Error in get_referral_list: ${e.message}`);
      return [];
    }
  }

  // ---------- Promo Codes ----------
  async create_promo_code(code, amount, max_uses = 1, expires_days = 365, user_restricted_id = 0) {
    try {
      const formattedCode = code.toUpperCase();
      const codeRef = doc(this.db, "promo_codes", formattedCode);
      const snap = await getDoc(codeRef);
      if (snap.exists()) return false;
      const expires_at = new Date(Date.now() + expires_days * 86400000).toISOString();
      await setDoc(codeRef, {
        code: formattedCode,
        amount: parseFloat(amount),
        max_uses: parseInt(max_uses, 10),
        used_count: 0,
        expires_at,
        user_restricted_id: parseInt(user_restricted_id, 10)
      });
      return true;
    } catch (e) {
      logger.error(`Error in create_promo_code: ${e.message}`);
      return false;
    }
  }

  async get_promo_code(code) {
    try {
      const formattedCode = code.toUpperCase();
      const snap = await getDoc(doc(this.db, "promo_codes", formattedCode));
      if (snap.exists()) return { code: formattedCode, ...snap.data() };
      return null;
    } catch (e) {
      logger.error(`Error in get_promo_code: ${e.message}`);
      return null;
    }
  }

  async has_user_used_code(code, user_id) {
    try {
      const useId = `${code.toUpperCase()}_${user_id}`;
      const snap = await getDoc(doc(this.db, "promo_code_uses", useId));
      return snap.exists();
    } catch (e) {
      logger.error(`Error in has_user_used_code: ${e.message}`);
      return false;
    }
  }

  async record_promo_code_use(code, user_id) {
    try {
      const useId = `${code.toUpperCase()}_${user_id}`;
      await setDoc(doc(this.db, "promo_code_uses", useId), {
        code: code.toUpperCase(),
        user_id: String(user_id),
        used_at: new Date().toISOString()
      });
    } catch (e) {
      logger.error(`Error in record_promo_code_use: ${e.message}`);
    }
  }

  async use_promo_code(code, user_id) {
    const promo = await this.get_promo_code(code);
    if (!promo) return [false, 0.0, "Invalid code."];
    if (parseInt(promo.used_count || 0, 10) >= parseInt(promo.max_uses || 0, 10)) return [false, 0.0, "Code already fully used."];
    if (promo.expires_at && new Date() > new Date(promo.expires_at)) return [false, 0.0, "Code expired."];
    if (parseInt(promo.user_restricted_id || 0, 10) && parseInt(promo.user_restricted_id, 10) !== user_id) return [false, 0.0, "This code is not for you."];
    if (await this.has_user_used_code(code, user_id)) return [false, 0.0, "You have already redeemed this code."];
    try {
      const new_count = parseInt(promo.used_count || 0, 10) + 1;
      await setDoc(doc(this.db, "promo_codes", code.toUpperCase()), { used_count: new_count }, { merge: true });
      await this.record_promo_code_use(code, user_id);
      return [true, parseFloat(promo.amount || 0.0), ""];
    } catch (e) {
      return [false, 0.0, `Error: ${e.message}`];
    }
  }

  async delete_promo_code(code) {
    try {
      await deleteDoc(doc(this.db, "promo_codes", code.toUpperCase()));
    } catch (e) {
      logger.error(`Error in delete_promo_code: ${e.message}`);
    }
  }

  async list_promo_codes() {
    try {
      const snap = await getDocs(collection(this.db, "promo_codes"));
      const codes = [];
      snap.forEach(docSnap => codes.push({ code: docSnap.id, ...docSnap.data() }));
      return codes;
    } catch (e) {
      logger.error(`Error in list_promo_codes: ${e.message}`);
      return [];
    }
  }

  // ---------- Settings ----------
  async load_settings(targetSettingsObj) {
    try {
      const snap = await getDocs(collection(this.db, "settings"));
      snap.forEach(docSnap => {
        const key = docSnap.id;
        const data = docSnap.data();
        const val = data ? data.value : null;
        if (val === undefined || val === null) return;
        switch(key) {
          case "maintenance_mode": targetSettingsObj.MAINTENANCE_MODE = String(val) === "1" || val === true; break;
          case "withdrawal_fee_percent": targetSettingsObj.WITHDRAWAL_FEE_PERCENT = parseFloat(val); break;
          case "max_deposit_limit": targetSettingsObj.MAX_DEPOSIT_LIMIT = parseFloat(val); break;
          case "max_withdraw_limit": targetSettingsObj.MAX_WITHDRAW_LIMIT = parseFloat(val); break;
          case "max_daily_orders": targetSettingsObj.MAX_DAILY_ORDERS = parseInt(val, 10); break;
          case "report_events": targetSettingsObj.REPORT_EVENTS = String(val) === "1" || val === true; break;
          case "telegram_stars_markup": targetSettingsObj.TELEGRAM_STARS_MARKUP = parseFloat(val); break;
          case "telegram_premium_markup": targetSettingsObj.TELEGRAM_PREMIUM_MARKUP = parseFloat(val); break;
        }
      });
    } catch (e) {
      logger.error(`Error in load_settings: ${e.message}`);
    }
  }

  async save_setting(key, value, targetSettingsObj = null) {
    try {
      await setDoc(doc(this.db, "settings", key), { value: String(value) }, { merge: true });
      if (targetSettingsObj) await this.load_settings(targetSettingsObj);
    } catch (e) {
      logger.error(`Error in save_setting: ${e.message}`);
    }
  }

  async get_telegram_stars_markup(defaultMarkup = 0.0) {
    try {
      const snap = await getDoc(doc(this.db, "settings", "telegram_stars_markup"));
      if (snap.exists()) {
        const data = snap.data();
        return data && data.value !== undefined ? parseFloat(data.value) : defaultMarkup;
      }
      return defaultMarkup;
    } catch (e) {
      return defaultMarkup;
    }
  }

  async get_telegram_premium_markup(defaultMarkup = 0.0) {
    try {
      const snap = await getDoc(doc(this.db, "settings", "telegram_premium_markup"));
      if (snap.exists()) {
        const data = snap.data();
        return data && data.value !== undefined ? parseFloat(data.value) : defaultMarkup;
      }
      return defaultMarkup;
    } catch (e) {
      return defaultMarkup;
    }
  }

  async get_game_markup(game_code) {
    try {
      const snap = await getDoc(doc(this.db, "game_config", game_code));
      if (snap.exists()) {
        const data = snap.data();
        return parseFloat(data.markup_percent || 0.0);
      }
      return 0.0;
    } catch (e) {
      return 0.0;
    }
  }

  async set_game_markup(game_code, markup) {
    try {
      await setDoc(doc(this.db, "game_config", game_code), { markup_percent: parseFloat(markup) }, { merge: true });
    } catch (e) {
      logger.error(`Error in set_game_markup: ${e.message}`);
    }
  }

  async get_product_price_override(product_id) {
    try {
      const snap = await getDoc(doc(this.db, "product_prices", String(product_id)));
      if (snap.exists()) {
        const data = snap.data();
        return data && data.price_override !== undefined && data.price_override !== null ? parseFloat(data.price_override) : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async set_product_price_override(product_id, price, type = "stars") {
    try {
      const ref = doc(this.db, "product_prices", String(product_id));
      if (price === null || price === undefined || price <= 0) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, {
          game_code: "Telegram",
          type,
          price_override: parseFloat(price),
          updated_at: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      logger.error(`Error in set_product_price_override: ${e.message}`);
    }
  }

  async get_all_product_overrides() {
    try {
      const snap = await getDocs(collection(this.db, "product_prices"));
      const overrides = [];
      snap.forEach(docSnap => overrides.push({ id: docSnap.id, ...docSnap.data() }));
      return overrides;
    } catch (e) {
      logger.error(`Error in get_all_product_overrides: ${e.message}`);
      return [];
    }
  }

  async update_product_price(product_id, price_etb, product_type = "stars") {
    try {
      const ref = doc(this.db, "product_prices", String(product_id));
      await setDoc(ref, {
        game_code: "Telegram",
        type: product_type,
        computed_price_etb: parseFloat(price_etb),
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      logger.error(`Error in update_product_price: ${e.message}`);
    }
  }

  async is_transaction_used(transaction_id) {
    try {
      const snap = await getDoc(doc(this.db, "used_transactions", transaction_id.toUpperCase()));
      return snap.exists();
    } catch (e) {
      logger.error(`Error in is_transaction_used: ${e.message}`);
      return false;
    }
  }

  async record_transaction_use(transaction_id, user_id, amount) {
    try {
      await setDoc(doc(this.db, "used_transactions", transaction_id.toUpperCase()), {
        user_id: String(user_id),
        amount: parseFloat(amount),
        created_at: new Date().toISOString()
      });
    } catch (e) {
      logger.error(`Error in record_transaction_use: ${e.message}`);
    }
  }

  async get_dashboard_stats() {
    const users = await this.get_all_users();
    const total_users = users.length;
    let total_deposits = 0, total_deposit_amount = 0.0, pending_deposits = 0;
    try {
      const depSnap = await getDocs(collection(this.db, "deposits"));
      depSnap.forEach(d => {
        const data = d.data();
        if (data.status === "approved") {
          total_deposits += 1;
          total_deposit_amount += parseFloat(data.amount || 0.0);
        } else if (data.status === "pending") pending_deposits += 1;
      });
    } catch (e) { logger.error(`Error fetching deposits stats: ${e.message}`); }

    let total_withdrawals = 0, total_withdrawal_amount = 0.0, pending_withdrawals = 0;
    try {
      const wthSnap = await getDocs(collection(this.db, "withdrawals"));
      wthSnap.forEach(d => {
        const data = d.data();
        const status = (data.status || "").toUpperCase();
        if (status === "APPROVED") {
          total_withdrawals += 1;
          total_withdrawal_amount += parseFloat(data.amount || 0.0);
        } else if (status === "PENDING") pending_withdrawals += 1;
      });
    } catch (e) { logger.error(`Error fetching withdrawals stats: ${e.message}`); }

    let total_orders = 0, revenue_today = 0.0;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const ordSnap = await getDocs(collection(this.db, "orders"));
      ordSnap.forEach(d => {
        const data = d.data();
        if (data.status === "COMPLETED") {
          total_orders += 1;
          if ((data.created_at || "").startsWith(today)) revenue_today += parseFloat(data.charged_price || 0.0);
        }
      });
    } catch (e) { logger.error(`Error fetching orders stats: ${e.message}`); }

    return { total_users, total_deposits, total_deposit_amount, pending_deposits, total_withdrawals, total_withdrawal_amount, pending_withdrawals, total_orders, revenue_today };
  }

  async search_deposits(user_id = null, date_from = null, date_to = null) {
    try {
      const snap = await getDocs(collection(this.db, "deposits"));
      const deposits = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (user_id !== null && String(data.user_id) !== String(user_id)) return;
        if (date_from && (data.created_at || "") < date_from) return;
        if (date_to && (data.created_at || "") > date_to + " 23:59:59") return;
        deposits.push(data);
      });
      return deposits;
    } catch (e) {
      logger.error(`Error in search_deposits: ${e.message}`);
      return [];
    }
  }

  async search_withdrawals(user_id = null, date_from = null, date_to = null) {
    try {
      const snap = await getDocs(collection(this.db, "withdrawals"));
      const withdrawals = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (user_id !== null && String(data.user_id) !== String(user_id)) return;
        if (date_from && (data.created_at || "") < date_from) return;
        if (date_to && (data.created_at || "") > date_to + " 23:59:59") return;
        withdrawals.push(data);
      });
      return withdrawals;
    } catch (e) {
      logger.error(`Error in search_withdrawals: ${e.message}`);
      return [];
    }
  }
}

// ===================================================================
// 7. CATALOG SERVICE
// ===================================================================
class CatalogService {
  constructor(api_client, db) {
    this.api_client = api_client;
    this.db = db;
    this._telegram_code = null;
    this._catalog_cache = null;
    this._stars_cache = null;
    this._premium_cache = null;
    this._cache_time = 0;
    this._cache_ttl = 600;
  }

  async _get_telegram_game_code() {
    if (this._telegram_code) return this._telegram_code;
    const exact_code = "Telegram";
    const res = await this.api_client.get_game_catalogue(exact_code);
    if (res && res.success && res.catalogues) {
      this._telegram_code = exact_code;
      return exact_code;
    }
    const games_res = await this.api_client.get_games();
    if (!games_res || !games_res.success) return null;
    const games = games_res.games || games_res.data || [];
    for (const game of games) {
      const name = (game.name || "").toLowerCase();
      const code = game.code || "";
      if (name.includes("telegram") || code.toLowerCase().includes("telegram") || name.includes("topup") || code.toLowerCase().includes("topup")) {
        this._telegram_code = code;
        return code;
      }
    }
    return null;
  }

  async get_telegram_catalogue(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this._catalog_cache && (now - this._cache_time) < this._cache_ttl * 1000) {
      return this._catalog_cache;
    }
    const game_code = await this._get_telegram_game_code();
    if (!game_code) return [];
    const res = await this.api_client.get_game_catalogue(game_code);
    if (!res || !res.success) return [];
    const items = res.catalogues || [];
    const annotated = [];
    for (const it of items) {
      const n = (it.name || "").toLowerCase();
      let kind = null;
      if (n.includes("star")) kind = "stars";
      else if (n.includes("premium")) kind = "premium";
      const newItem = { ...it, _kind: kind, _game_code: game_code };
      const product_id = it.id || it.code || it.name;
      if (product_id) {
        const override = await this.db.get_product_price_override(product_id);
        if (override !== null && override !== undefined) {
          newItem._override_price = override;
          await this.db.update_product_price(product_id, override, kind || "stars");
        } else {
          if (kind === "stars") {
            const parsed = parse_telegram_name(it.name || "");
            let computed;
            if (parsed && parsed[0] === "stars") {
              const amount = parsed[1];
              computed = amount * 3;
            } else {
              const api_price = parseFloat(it.unit_price || it.price || it.amount || 0.0);
              const markup = await this.db.get_telegram_stars_markup();
              computed = api_price_to_birr(api_price, markup);
            }
            await this.db.update_product_price(product_id, computed, "stars");
            newItem._computed_price = computed;
          } else if (kind === "premium") {
            const api_price = parseFloat(it.unit_price || it.price || it.amount || 0.0);
            const markup = await this.db.get_telegram_premium_markup();
            const computed = api_price_to_birr(api_price, markup);
            await this.db.update_product_price(product_id, computed, "premium");
            newItem._computed_price = computed;
          } else {
            const api_price = parseFloat(it.unit_price || it.price || it.amount || 0.0);
            const computed = api_price_to_birr(api_price, 0);
            await this.db.update_product_price(product_id, computed, "other");
            newItem._computed_price = computed;
          }
        }
      }
      annotated.push(newItem);
    }
    this._catalog_cache = annotated;
    this._cache_time = now;
    this._stars_cache = null;
    this._premium_cache = null;
    return annotated;
  }

  async get_telegram_stars_packages(forceRefresh = false) {
    if (!forceRefresh && this._stars_cache) return this._stars_cache;
    const cat = await this.get_telegram_catalogue(forceRefresh);
    this._stars_cache = cat.filter(it => it._kind === "stars");
    return this._stars_cache;
  }

  async get_telegram_premium_plans(forceRefresh = false) {
    if (!forceRefresh && this._premium_cache) return this._premium_cache;
    const cat = await this.get_telegram_catalogue(forceRefresh);
    this._premium_cache = cat.filter(it => it._kind === "premium");
    return this._premium_cache;
  }

  async get_telegram_stars_markup() {
    return await this.db.get_telegram_stars_markup();
  }

  async get_telegram_premium_markup() {
    return await this.db.get_telegram_premium_markup();
  }
}

// ===================================================================
// 8. MAIN APPLICATION – Webhook Mode
// ===================================================================

// Global state
const userSessions = new Map();
const pending_decline = {};
const verify_attempts = {};
const userLastMessage = new Map();

function getUserSession(userId) {
  if (!userSessions.has(userId)) userSessions.set(userId, { state: null, data: {} });
  return userSessions.get(userId);
}

function clearUserSession(userId) {
  if (userSessions.has(userId)) userSessions.set(userId, { state: null, data: {} });
}

// Helpers: sendOrEdit and sendOrEditPhoto (unchanged)
async function sendOrEdit(ctx, text, extra = {}) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const prev = userLastMessage.get(userId);
  if (prev && prev.type === 'text') {
    try {
      await ctx.telegram.editMessageText(chatId, prev.messageId, undefined, text, { parse_mode: "HTML", ...extra });
      return { chatId, messageId: prev.messageId };
    } catch (e) {
      try { await ctx.telegram.deleteMessage(prev.chatId, prev.messageId); } catch (_) {}
      userLastMessage.delete(userId);
    }
  } else if (prev) {
    try { await ctx.telegram.deleteMessage(prev.chatId, prev.messageId); } catch (_) {}
    userLastMessage.delete(userId);
  }
  const sent = await ctx.reply(text, { parse_mode: "HTML", ...extra });
  userLastMessage.set(userId, { chatId: sent.chat.id, messageId: sent.message_id, type: 'text' });
  return sent;
}

async function sendOrEditPhoto(ctx, photo, caption, extra = {}) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const prev = userLastMessage.get(userId);
  if (prev) {
    try { await ctx.telegram.deleteMessage(prev.chatId, prev.messageId); } catch (_) {}
    userLastMessage.delete(userId);
  }
  const sent = await ctx.replyWithPhoto(photo, { caption, parse_mode: "HTML", ...extra });
  userLastMessage.set(userId, { chatId: sent.chat.id, messageId: sent.message_id, type: 'photo' });
  return sent;
}

// Application settings (same)
const appSettings = {
  MAINTENANCE_MODE: false,
  WITHDRAWAL_FEE_PERCENT: 0.0,
  MAX_DEPOSIT_LIMIT: 100000,
  MAX_WITHDRAW_LIMIT: 50000,
  MAX_DAILY_ORDERS: 50,
  REPORT_EVENTS: true,
  TELEGRAM_STARS_MARKUP: 0.0,
  TELEGRAM_PREMIUM_MARKUP: 0.0
};

const ADMIN_PASSWORD = "EXYNOS39@#$%&*HSSH671S";
const REFERRAL_REWARD = 2.0;
const MAX_TXN_AGE_MINUTES = 15;

const IMG_TRANSACTION_ID = "https://i.ibb.co/qMts3xr8/Tb-SINTAYEHU.jpg";
const IMG_CBE_TRANSACTION_ID = "https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAIs3mp2IUPoCLWCk0Kyv3rGBw9iGRuWAAKHDGsbM5axUzJRjYwRt86KAQADAgADeQADPQQ";

// State IDs (keep all)
const STATE_SERVICE_SELECT = 0;
const STATE_GAME_SELECT = 1;
const STATE_SELECT_PKG = 2;
const STATE_ENTER_UID = 3;
const STATE_CONFIRM = 4;
const STATE_DEPOSIT_AMOUNT = 5;
const STATE_DEPOSIT_PROOF = 6;
const STATE_WITHDRAW_ACCOUNT = 7;
const STATE_WITHDRAW_AMOUNT = 8;
const STATE_WITHDRAW_CONFIRM = 9;
const STATE_WITHDRAW_NICKNAME = 10;
const STATE_SEARCH_GAME = 11;
const STATE_DEPOSIT_TRANSACTION_ID = 12;
const STATE_REDEEM_CODE = 13;
const STATE_ADMIN_MAIN = 14;
const STATE_ADMIN_BROADCAST = 15;
const STATE_ADMIN_CREATE_CODE = 16;
const STATE_ADMIN_DELETE_CODE = 17;
const STATE_ADMIN_MANAGE_DEPOSITS = 18;
const STATE_ADMIN_MANAGE_WITHDRAWALS = 19;
const STATE_ADMIN_REFERRAL_INPUT = 20;
const STATE_ADMIN_BAN = 21;
const STATE_ADMIN_UNBAN = 22;
const STATE_ADMIN_SETBALANCE = 23;
const STATE_ADMIN_SEARCH_TX = 24;
const STATE_ADMIN_STARS_MARKUP = 25;
const STATE_ADMIN_PREMIUM_MARKUP = 26;
const STATE_ADMIN_LOGIN = 31;
const STATE_ADMIN_SEARCH_BY_ID = 32;
const STATE_PROFILE_REFERRAL = 35;
const STATE_PROFILE_REDEEM = 36;
const STATE_PAYMENT_METHOD = 37;
const STATE_PAYMENT_TXN_ID = 38;
const STATE_ADMIN_SET_PRICE_TYPE = 39;
const STATE_ADMIN_SET_PRICE_SELECT = 40;
const STATE_ADMIN_SET_PRICE_INPUT = 41;

// Helper functions
const NOTICE_CHANNEL_ID = REPORT_CHANNEL_ID;
const ADMIN_CHAT_IDS = Array.isArray(ADMIN_CHAT_ID) ? ADMIN_CHAT_ID : [ADMIN_CHAT_ID];
const REPORT_CHAT_ID = REPORT_CHANNEL_ID || PROOF_CHANNEL_ID;

async function check_channel_membership(ctx) {
  const user_id = ctx.from ? ctx.from.id : null;
  if (!user_id) return true;
  const channels = [];
  if (PROOF_CHANNEL_ID) channels.push(["Proof Channel", PROOF_CHANNEL_ID]);
  if (NOTICE_CHANNEL_ID && NOTICE_CHANNEL_ID !== PROOF_CHANNEL_ID) channels.push(["Notice Channel", NOTICE_CHANNEL_ID]);
  if (!channels.length) return true;
  const missing = [];
  for (const [name, channel_id] of channels) {
    try {
      const member = await ctx.telegram.getChatMember(channel_id, user_id);
      if (!["member", "administrator", "creator"].includes(member.status)) missing.push([name, channel_id]);
    } catch (e) {
      logger.warn(`Could not check membership for ${name} (ID ${channel_id}): ${e.message}`);
      missing.push([name, channel_id]);
    }
  }
  if (!missing.length) return true;
  let msg = `${EMOJI_WARNING} <b>You must join the following channels to use this bot:</b>\n\n`;
  for (const [name, channel_id] of missing) {
    let link_text;
    try {
      const invite_link = await ctx.telegram.createChatInviteLink(channel_id, { member_limit: 1 });
      link_text = invite_link.invite_link;
    } catch (e) {
      try {
        const chat = await ctx.telegram.getChat(channel_id);
        link_text = chat.username ? `https://t.me/${chat.username}` : `Channel ID: ${channel_id}`;
      } catch (_) { link_text = `Channel ID: ${channel_id}`; }
    }
    msg += `• <b>${name}</b>: <a href='${link_text}'>Join here</a>\n`;
  }
  msg += "\nAfter joining, restart the bot or type /start again.";
  if (ctx.callbackQuery) {
    try { await ctx.answerCbQuery("Please join the required channels first.", { show_alert: true }); } catch (_) {}
    await sendOrEdit(ctx, msg);
  } else {
    await sendOrEdit(ctx, msg);
  }
  return false;
}

async function report_event(bot, text, parse_mode = "HTML") {
  if (!appSettings.REPORT_EVENTS || !REPORT_CHAT_ID) return;
  try {
    await bot.telegram.sendMessage(REPORT_CHAT_ID, text, { parse_mode });
  } catch (e) { logger.error(`Failed to send report: ${e.message}`); }
}

async function maintenance_check(ctx) {
  const userId = ctx.from ? ctx.from.id : 0;
  if (appSettings.MAINTENANCE_MODE && !ADMIN_CHAT_IDS.includes(userId)) {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(`${EMOJI_WARNING} Bot is under maintenance.`, { show_alert: true });
    } else {
      await sendOrEdit(ctx, `${EMOJI_WARNING} Bot is under maintenance. Please try again later.`);
    }
    return false;
  }
  return true;
}

async function clear_last_photo(ctx, session) {
  const userId = ctx.from.id;
  if (session && session.data && session.data.last_photo) {
    const [chat_id, message_id] = session.data.last_photo;
    try { await ctx.telegram.deleteMessage(chat_id, message_id); } catch (_) {}
    delete session.data.last_photo;
    const prev = userLastMessage.get(userId);
    if (prev && prev.chatId === chat_id && prev.messageId === message_id) userLastMessage.delete(userId);
  }
}

async function register_user_implicit(ctx, db, bot) {
  const user = ctx.from;
  if (!user) return false;
  if (await db.is_banned(user.id)) {
    if (!ctx.callbackQuery) await sendOrEdit(ctx, `${EMOJI_CROSS} You are banned from using this bot.`);
    return false;
  }
  const existing = await db.get_user(user.id);
  await db.add_user(user.id, user.username, user.first_name);
  if (!existing || !Object.keys(existing).length) {
    const userMention = `<a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>`;
    await report_event(bot,
      `${EMOJI_USER} <b>New User</b>\n${EMOJI_USER} ${userMention} (ID: <code>${user.id}</code>)\n${EMOJI_CALENDAR} ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`
    );
    return true;
  }
  return false;
}

// Payment verification
async function verify_payment(reference, method = "telebirr") {
  const url = `${VERIFY_API_BASE_URL}/verify`;
  const headers = { "Content-Type": "application/json", "x-api-key": VERIFY_API_KEY };
  const payload = { reference };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await axios.post(url, payload, { headers, timeout: 30000 });
      if (resp.status !== 200) {
        if (attempt < 2) { await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000)); continue; }
        return null;
      }
      const data = resp.data;
      let amount = null, receiver_name = "", payment_date = null, txn_ref = null, receiver_account = null;
      const inner = data.data || {};
      if (Object.keys(inner).length) {
        const amount_str = inner.settledAmount || inner.amount || inner.Amount;
        if (amount_str) {
          const match = String(amount_str).match(/[\d,.]+/);
          if (match) amount = parseFloat(match[0].replace(/,/g, ''));
        }
        receiver_name = inner.receiverName || inner.receiver || "";
        payment_date = inner.paymentDate || inner.transactionDate || inner.date || "";
        txn_ref = inner.transactionNumber || inner.reference || reference;
        receiver_account = inner.receiverAccount || inner.creditedPartyAccount || inner.receiver;
      } else {
        const amount_str = data.amount || data.Amount || data.settledAmount;
        if (amount_str !== undefined && amount_str !== null) {
          const match = String(amount_str).match(/[\d,.]+/);
          if (match) amount = parseFloat(match[0].replace(/,/g, ''));
        }
        receiver_name = data.receiver || data.receiverName || "";
        payment_date = data.date || data.paymentDate || data.transactionDate || "";
        txn_ref = data.reference || data.transactionNumber || reference;
        receiver_account = data.receiverAccount || data.creditedPartyAccount || data.receiver;
      }
      if (amount === null || isNaN(amount)) return null;
      const expected_account = method === "telebirr" ? TELEBIRR_PHONE : CBE_PHONE;
      if (expected_account && receiver_account) {
        if (extract_last4(receiver_account) !== extract_last4(expected_account)) return null;
      }
      const expected_name = method === "telebirr" ? EXPECTED_RECEIVER_NAME : CBE_RECEIVER_NAME;
      if (expected_name && receiver_name) {
        if (receiver_name.trim().toUpperCase() !== expected_name.trim().toUpperCase()) return null;
      }
      if (payment_date) {
        try {
          const txn_dt = new Date(payment_date);
          if (!isNaN(txn_dt.getTime())) {
            const ageMinutes = (Date.now() - txn_dt.getTime()) / (60 * 1000);
            if (ageMinutes > MAX_TXN_AGE_MINUTES) return null;
          }
        } catch (e) { logger.warn(`Could not parse date ${payment_date}: ${e.message}`); }
      }
      return { amount, receiver_name, payment_date, reference: txn_ref || reference, receiver_account };
    } catch (e) {
      logger.error(`Verification attempt ${attempt + 1} error: ${e.message}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      else return null;
    }
  }
  return null;
}

// Order placement flow
async function place_order_flow(ctx, session, db, api_client, bot, payment_method = "wallet", txn_id = "", verified_amount = 0.0) {
  const user = ctx.from;
  const charged_price = session.data.charged_price || 0.0;
  if (payment_method !== "wallet" && verified_amount > 0 && verified_amount > charged_price) {
    const surplus = verified_amount - charged_price;
    await db.update_balance(user.id, surplus);
    await sendOrEdit(ctx,
      `${EMOJI_MONEY} <b>Overpayment detected!</b>\nYou sent <b>${Math.floor(verified_amount)} ETB</b>, but the order only costs <b>${Math.floor(charged_price)} ETB</b>.\nThe surplus <b>${Math.floor(surplus)} ETB</b> has been added to your wallet balance.`
    );
  }
  if (payment_method === "wallet") {
    await db.update_balance(user.id, -charged_price);
    const ref_bal = await db.get_referral_balance(user.id);
    if (ref_bal > 0) {
      const deduct_from_ref = Math.min(ref_bal, charged_price);
      await db.update_referral_balance(user.id, -deduct_from_ref);
    }
  }
  const game_code = session.data.telegram_game_code || "Telegram";
  const package_name = session.data.package_name;
  const display_name = session.data.package_display_name || package_name;
  const player_id = session.data.player_id;
  const nickname = session.data.nickname;
  const api_price = session.data.api_price;
  const game_name = session.data.game_name;
  const service_name = session.data.service_name;
  const markup = session.data.markup || 0.0;
  const idempotency_key = uuidv4();
  const pid = (player_id || "").trim();
  if (!pid) {
    await sendOrEdit(ctx, `${EMOJI_CROSS} Missing recipient. Please re-enter your Telegram username.`, { reply_markup: get_main_inline_keyboard() });
    clearUserSession(user.id);
    return;
  }
  const order_res = await api_client.place_order(game_code, package_name, pid, idempotency_key);
  if (order_res && order_res.success) {
    const api_order = order_res.order || {};
    const api_order_id = String(api_order.order_id || order_res.order_id || uuidv4().slice(0, 8));
    let codes_delivered = "";
    if (order_res.codes) {
      const codes_list = order_res.codes;
      codes_delivered = Array.isArray(codes_list) ? codes_list.map(c => `🔑 <code>${c}</code>`).join("\n") : `🔑 <code>${codes_list}</code>`;
    } else if (order_res.pin) codes_delivered = `🔑 <code>${order_res.pin}</code>`;
    else if (order_res.code) codes_delivered = `🔑 <code>${order_res.code}</code>`;
    await db.create_order(user.id, api_order_id, "COMPLETED", game_name, service_name, player_id, nickname, package_name, api_price, charged_price, markup, JSON.stringify(order_res));
    await db.increment_order_count(user.id);
    const delivered_directly = !codes_delivered;
    let success_msg =
      `${EMOJI_SUCCESS} <b>Purchase Successful!</b>\n\n` +
      `${EMOJI_ORDER} <b>Order ID:</b> <code>${api_order_id}</code>\n` +
      `${EMOJI_USER} <b>Nickname:</b> <code>${nickname}</code>\n` +
      `${EMOJI_USER} <b>Username:</b> <code>${player_id}</code>\n` +
      `${EMOJI_GAME} <b>Product:</b> ${game_name}\n` +
      `${EMOJI_ORDER} <b>Service:</b> ${service_name}\n` +
      `${EMOJI_MONEY} <b>Package:</b> ${display_name}\n` +
      `${EMOJI_MONEY} <b>Charged:</b> ${Math.floor(charged_price)}ETB\n` +
      `${EMOJI_CALENDAR} <b>Date:</b> ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC\n` +
      `${EMOJI_SUCCESS} <b>Status:</b> Completed`;
    if (delivered_directly) success_msg += `\n\n✨ <b>Delivered directly</b> to <code>${player_id}</code>'s Telegram account.`;
    else if (codes_delivered) success_msg += `\n\n🎁 <b>Redeem Code:</b>\n${codes_delivered}\n\n_Redeem this code in your Telegram account to activate._`;
    if (payment_method !== "wallet") success_msg += `\n\n${EMOJI_WALLET} <b>Paid via:</b> ${payment_method.toUpperCase()} (Ref: ${txn_id})`;
    await sendOrEdit(ctx, success_msg, { reply_markup: get_main_inline_keyboard() });
    const proof_text = `${EMOJI_ORDER} <b>New Purchase</b>\n${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n${EMOJI_GAME} ${game_name}\n${EMOJI_MONEY} ${display_name} – ${Math.floor(charged_price)}ETB\n🆔 Order: <code>${api_order_id}</code>\n${EMOJI_WALLET} Payment: ${payment_method.toUpperCase()}`;
    await report_event(bot, proof_text);
  } else {
    const err_msg = (order_res && order_res.message) || "Gateway failed.";
    if (payment_method === "wallet") await db.update_balance(user.id, charged_price);
    await sendOrEdit(ctx, `${EMOJI_CROSS} <b>Purchase Failed</b>\n\n⚠️ ${err_msg}`, { reply_markup: get_main_inline_keyboard() });
    await report_event(bot,
      `${EMOJI_CROSS} <b>Order Failed</b>\n${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n${EMOJI_GAME} ${game_name} / ${display_name}\n🆔 Player: <code>${player_id}</code>\n${EMOJI_MONEY} Charged: ${Math.floor(charged_price)} ETB\n⚠️ Error: ${err_msg}`
    );
  }
  clearUserSession(user.id);
}

// ---------- Main Function ----------
async function main() {
  const db = new FirestoreDatabase();
  await db.load_settings(appSettings);
  logger.info("✅ Initial settings loaded from Firestore (REST).");

  const api_client = new G2BulkAPIClient(G2BULK_BASE_URL, G2BULK_API_KEY, CACHE_TTL);
  const catalog_service = new CatalogService(api_client, db);

  const bot = new Telegraf(BOT_TOKEN);

  // Background settings sync (every 5 seconds)
  setInterval(async () => {
    try {
      await db.load_settings(appSettings);
    } catch (e) {
      logger.error(`Failed to sync settings: ${e.message}`);
    }
  }, 5000);

  // ---------- Register all commands and handlers ----------
  bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return;
    if (!(await maintenance_check(ctx))) return;
    if (!(await check_channel_membership(ctx))) return;
    if (await db.is_banned(user.id)) {
      await sendOrEdit(ctx, `${EMOJI_CROSS} You are banned.`);
      return;
    }
    await register_user_implicit(ctx, db, bot);
    const parts = (ctx.message.text || "").split(' ');
    if (parts.length > 1 && parts[1].startsWith('ref')) {
      try {
        const referrer_id = parseInt(parts[1].slice(3), 10);
        if (referrer_id !== user.id) {
          const success = await db.create_referral(referrer_id, user.id, REFERRAL_REWARD);
          if (success) {
            const userMention = `<a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>`;
            try {
              await bot.telegram.sendMessage(referrer_id, `${EMOJI_USER} ${userMention} joined using your referral link! You earned ${REFERRAL_REWARD} ETB!`, { parse_mode: "HTML" });
            } catch (_) {}
          }
        }
      } catch (_) {}
    }
    const caption =
      `${EMOJI_HOME} <b>Welcome, ${user.first_name}!</b>\n\n` +
      "🛒 Top‑up Telegram Stars & Premium at the best rates.\n" +
      `${EMOJI_MONEY} 10% service fee applied.\n\n` +
      "👇 Tap a colored button below:";
    const startImage = "https://i.ibb.co/9HbZmPRm/x.jpg";
    await sendOrEditPhoto(ctx, startImage, caption, { reply_markup: get_main_inline_keyboard() });
  });

  bot.command('admin', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) {
      await sendOrEdit(ctx, `${EMOJI_CROSS} Unauthorized.`);
      return;
    }
    const session = getUserSession(ctx.from.id);
    session.state = STATE_ADMIN_LOGIN;
    await sendOrEdit(ctx, "🔐 Enter admin password:");
  });

  bot.command('broadcast', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const text = ctx.message.text.replace(/^\/broadcast\s*/, '').trim();
    if (!text) {
      await sendOrEdit(ctx, "Usage: /broadcast <message>");
      return;
    }
    const users = await db.get_all_users();
    let success = 0;
    for (const uid of users) {
      try {
        await bot.telegram.sendMessage(uid, text);
        success++;
      } catch (_) {}
    }
    await sendOrEdit(ctx, `${EMOJI_SUCCESS} Broadcast sent to ${success}/${users.length} users.`);
  });

  bot.command('gencode', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendOrEdit(ctx, "Usage: /gencode <amount> [max_uses] [code]");
      return;
    }
    const amount = parseFloat(args[0]);
    if (isNaN(amount)) {
      await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid amount.`);
      return;
    }
    const max_uses = args.length > 1 ? parseInt(args[1], 10) : 1;
    const code = args.length > 2 ? args[2].toUpperCase() : uuidv4().slice(0, 8).toUpperCase();
    const success = await db.create_promo_code(code, amount, max_uses);
    if (success) await sendOrEdit(ctx, `${EMOJI_SUCCESS} Code <b>${code}</b> created for ${Math.floor(amount)} ETB, uses: ${max_uses}`);
    else await sendOrEdit(ctx, `${EMOJI_CROSS} Code already exists.`);
  });

  bot.command('listcodes', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const codes = await db.list_promo_codes();
    if (!codes.length) {
      await sendOrEdit(ctx, `${EMOJI_INFO} No promo codes found.`);
      return;
    }
    let msg = `${EMOJI_MONEY} <b>Active Promo Codes</b>\n\n`;
    for (const c of codes) msg += `<code>${c.code}</code>: ${Math.floor(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
    await sendOrEdit(ctx, msg);
  });

  bot.command('delcode', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendOrEdit(ctx, "Usage: /delcode <code>");
      return;
    }
    const code = args[0].toUpperCase();
    await db.delete_promo_code(code);
    await sendOrEdit(ctx, `${EMOJI_SUCCESS} Code <b>${code}</b> deleted.`);
  });

  bot.command('refer', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendOrEdit(ctx, "Usage: /refer <user_id>");
      return;
    }
    const user_id = parseInt(args[0], 10);
    if (isNaN(user_id)) {
      await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid ID.`);
      return;
    }
    const [total, rewarded, total_reward] = await db.get_referral_stats(user_id);
    const referrals = await db.get_referral_list(user_id);
    let msg = `${EMOJI_INFO} <b>Referral Stats for ID <code>${user_id}</code></b>\n\n`;
    msg += `${EMOJI_USER} Total invited: <b>${total}</b>\n`;
    msg += `${EMOJI_MONEY} Rewarded: <b>${rewarded}</b>\n`;
    msg += `${EMOJI_MONEY} Total earned: <b>${Math.floor(total_reward)} ETB</b>\n\n`;
    if (referrals.length) {
      msg += "<b>Recent invites:</b>\n";
      for (const r of referrals) {
        const status_icon = r.reward_given ? EMOJI_SUCCESS : EMOJI_CLOCK;
        msg += `  ${status_icon} <code>${r.referred_id}</code> (${r.status}) – ${(r.created_at || "").slice(0, 10)}\n`;
      }
    } else {
      msg += "<i>No invites yet.</i>";
    }
    await sendOrEdit(ctx, msg);
  });

  bot.command('listgames', async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const games_res = await api_client.get_games();
    const games = (games_res && (games_res.games || games_res.data)) || [];
    if (!games.length) {
      await sendOrEdit(ctx, "No games found.");
      return;
    }
    let msg = `${EMOJI_GAME} <b>Game Codes</b>\n\n`;
    for (const g of games) msg += `<code>${g.code}</code> – ${g.name}\n`;
    await sendOrEdit(ctx, msg);
  });

  // ---------- Callback Query Handler ----------
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const session = getUserSession(userId);
    await ctx.answerCbQuery().catch(() => {});
    if (await db.is_banned(userId)) {
      await sendOrEdit(ctx, `${EMOJI_CROSS} You are banned.`);
      return;
    }
    if (data === "cancel_action") {
      await clear_last_photo(ctx, session);
      clearUserSession(userId);
      delete verify_attempts[userId];
      await sendOrEdit(ctx, `${EMOJI_CROSS} Action cancelled.`, { reply_markup: get_main_inline_keyboard() });
      return;
    }
    if (data === "back_to_main") {
      await clear_last_photo(ctx, session);
      clearUserSession(userId);
      if (!(await check_channel_membership(ctx))) return;
      await sendOrEdit(ctx, `${EMOJI_HOME} <b>Main Menu</b>`, { reply_markup: get_main_inline_keyboard() });
      return;
    }
    // ---------- Profile ----------
    if (data === "menu_profile") {
      const user_data = await db.get_user_profile(userId);
      if (!user_data || !Object.keys(user_data).length) {
        await sendOrEdit(ctx, `${EMOJI_WARNING} Profile sync delayed.`, { reply_markup: get_main_inline_keyboard() });
        return;
      }
      const reg_date = (user_data.registered_at || "").slice(0, 10);
      const profile_text =
        `${EMOJI_PROFILE} <b>User Profile</b>\n\n` +
        `${EMOJI_USER} <b>Name:</b> ${user_data.first_name || "N/A"}\n` +
        `${EMOJI_USER} <b>Username:</b> @${user_data.username || "N/A"}\n` +
        `🆔 <b>ID:</b> <code>${user_data.telegram_id}</code>\n` +
        `${EMOJI_MONEY} <b>Balance:</b> ${Math.floor(user_data.balance)} ETB\n` +
        `${EMOJI_MONEY} <b>Referral Balance:</b> ${Math.floor(user_data.referral_balance)} ETB\n` +
        `${EMOJI_CALENDAR} <b>Registered:</b> ${reg_date}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `${EMOJI_ORDER} <b>Completed Orders:</b> ${user_data.total_orders}\n` +
        `${EMOJI_MONEY} <b>Total Spent:</b> ${Math.floor(user_data.total_spent)} ETB\n`;
      await sendOrEdit(ctx, profile_text, { reply_markup: get_profile_keyboard() });
      return;
    }
    if (data === "menu_orders") {
      const orders = await db.get_user_orders(userId, 5);
      let text;
      if (!orders.length) text = `${EMOJI_ORDER} <b>No orders yet.</b>`;
      else {
        text = `${EMOJI_ORDER} <b>Last 5 Orders:</b>\n\n`;
        for (const order of orders) {
          text +=
            `${EMOJI_ORDER} <b>Order ID:</b> <code>${order.order_id}</code>\n` +
            `${EMOJI_GAME} <b>Product:</b> ${order.game}\n` +
            `${EMOJI_MONEY} <b>Package:</b> ${order.package_name}\n` +
            `${EMOJI_MONEY} <b>Charged:</b> ${Math.floor(order.charged_price)} ETB\n` +
            `${EMOJI_SUCCESS} <b>Status:</b> ${order.status}\n` +
            `${EMOJI_CALENDAR} <b>Date:</b> ${(order.created_at || "").slice(0, 10)}\n` +
            "━━━━━━━━━━━━━━━━━━━━━━\n";
        }
      }
      await sendOrEdit(ctx, text, { reply_markup: get_main_inline_keyboard() });
      return;
    }
    if (data === "menu_support") {
      clearUserSession(userId);
      const help_msg =
        `${EMOJI_SUPPORT} <b>Support & Help</b>\n\n` +
        "<b>🚀 Quick start:</b>\n" +
        "1. Use the <b>inline buttons</b> in the message below the keyboard to navigate.\n" +
        "2. Most flows guide you step by step — just follow the prompts.\n\n" +
        `${EMOJI_MONEY} <b>Deposit (Telebirr / CBE):</b>\n` +
        "1. Tap <b>Deposit</b> in the main menu.\n" +
        "2. Choose <b>Telebirr (ETB)</b> or <b>CBE (ETB)</b>.\n" +
        `3. Enter the amount (min ${MIN_DEPOSIT_BIRR} ETB, max ${appSettings.MAX_DEPOSIT_LIMIT} ETB).\n` +
        "4. Send the money to the number shown.\n" +
        "5. After paying, <b>type the Transaction ID</b> (Telebirr) or <b>Transaction Link</b> (CBE).\n" +
        "6. Once verified, the ETB is added to your balance automatically.\n\n" +
        `${EMOJI_MONEY} <b>Withdraw (Telebirr):</b>\n` +
        "1. Tap <b>Withdraw</b> in the main menu.\n" +
        "2. Enter your Telebirr phone number and a nickname.\n" +
        `3. Enter the amount (min ${MIN_WITHDRAW_BIRR} ETB, max ${appSettings.MAX_WITHDRAW_LIMIT} ETB).\n` +
        "4. Confirm — admin will review and send the money.\n\n" +
        `${EMOJI_STAR} <b>Telegram Services:</b>\n` +
        "1. Tap <b>Service</b> in the main menu.\n" +
        "2. Choose <b>Telegram Stars</b> or <b>Telegram Premium</b>.\n" +
        "3. Pick a package.\n" +
        "4. Enter your Telegram <b>@username</b> (must start with @).\n" +
        "5. Choose payment method: <b>Wallet</b> (deduct from balance), <b>CBE</b>, or <b>Telebirr</b>.\n" +
        "6. For external payments, you'll see the account details and amount to pay, then provide the transaction reference.\n" +
        "   If you pay more than the order total, the extra is added to your wallet balance.\n\n" +
        `${EMOJI_USER} <b>Referral:</b>\n` +
        `Tap Referral in Profile to get your invite link. Each friend earns you ${REFERRAL_REWARD} ETB instantly.\n\n` +
        `Need more help? Contact ${ADMIN_USERNAME}`;
      await sendOrEdit(ctx, help_msg, { reply_markup: get_support_keyboard() });
      return;
    }
    if (data === "profile_referral") {
      const [total, rewarded, total_reward] = await db.get_referral_stats(userId);
      const me = await bot.telegram.getMe();
      const ref_link = `https://t.me/${me.username}?start=ref${userId}`;
      const msgText =
        `${EMOJI_USER} <b>Your Referral Stats</b>\n\n` +
        `${EMOJI_USER} <b>Your Link:</b> <code>${ref_link}</code>\n` +
        `${EMOJI_USER} <b>Total Invites:</b> ${total}\n` +
        `${EMOJI_MONEY} <b>Rewarded:</b> ${rewarded}\n` +
        `${EMOJI_MONEY} <b>Total Earned:</b> ${Math.floor(total_reward)} ETB\n` +
        `${EMOJI_MONEY} <b>Reward per invite:</b> ${REFERRAL_REWARD} ETB (instant, not withdrawable)\n\n` +
        "<i>Share your link. Each new user who joins gives you an instant reward!</i>";
      const kb = { inline_keyboard: [[{ text: "Back to Profile", callback_data: "menu_profile", icon_custom_emoji_id: ID_BACK }]] };
      await sendOrEdit(ctx, msgText, { reply_markup: kb });
      return;
    }
    if (data === "profile_redeem") {
      session.state = STATE_PROFILE_REDEEM;
      const msgText = `${EMOJI_MONEY} <b>Enter your promo code:</b>`;
      const kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL }]] };
      await sendOrEdit(ctx, msgText, { reply_markup: kb });
      return;
    }
    // ---------- Service Flow ----------
    if (data === "menu_service" || data === "back_to_service") {
      if (!(await maintenance_check(ctx))) return;
      if (!(await check_channel_membership(ctx))) return;
      await clear_last_photo(ctx, session);
      session.state = STATE_SERVICE_SELECT;
      await sendOrEdit(ctx, `${EMOJI_GAME} <b>Choose a Telegram service:</b>`, { reply_markup: get_service_inline_keyboard() });
      return;
    }
    if (data.startsWith("svc_telegram_")) {
      const selection = data.split("_")[2];
      session.data.game_code = "Telegram";
      session.data.telegram_kind = selection;
      session.data.game_name = selection === "stars" ? "Telegram Stars" : "Telegram Premium";
      session.data.flow_type = "telegram";
      await clear_last_photo(ctx, session);
      const emoji = selection === "stars" ? EMOJI_STAR : EMOJI_PREMIUM;
      await sendOrEdit(ctx, `${emoji} <b>${session.data.game_name}</b>\n\n🔄 Loading packages...`);
      let packages = [], markup = 0.0;
      try {
        if (selection === "stars") {
          packages = await catalog_service.get_telegram_stars_packages();
          markup = await catalog_service.get_telegram_stars_markup();
        } else {
          packages = await catalog_service.get_telegram_premium_plans();
          markup = await catalog_service.get_telegram_premium_markup();
        }
      } catch (e) {
        logger.error(`Error fetching Telegram packages: ${e.message}`);
        await sendOrEdit(ctx, `${EMOJI_CROSS} Failed to load plans.`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "back_to_service", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (!packages.length) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} No plans found.`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "back_to_service", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      session.data.active_packages = packages;
      session.data.telegram_markup = markup;
      session.data.telegram_game_code = packages[0]._game_code || "Telegram";
      session.data.package_raw_names = {};
      const keyboard_buttons = [];
      for (let idx = 0; idx < packages.length; idx++) {
        const pkg = packages[idx];
        const raw_name = pkg.name || pkg.title || "Package";
        const override = pkg._override_price;
        let birr_price;
        if (selection === "stars" && (override === undefined || override === null)) {
          const parsed = parse_telegram_name(raw_name);
          if (parsed && parsed[0] === "stars") {
            const amount = parsed[1];
            birr_price = amount * 3;
          } else {
            const api_price = parseFloat(pkg.unit_price || pkg.price || pkg.amount || 0.0);
            birr_price = api_price_to_birr(api_price, markup);
          }
        } else {
          if (override !== undefined && override !== null) birr_price = override;
          else {
            const api_price = parseFloat(pkg.unit_price || pkg.price || pkg.amount || 0.0);
            birr_price = api_price_to_birr(api_price, markup);
          }
        }
        session.data.package_raw_names[String(idx)] = raw_name;
        const display_text = format_telegram_display(raw_name, birr_price);
        session.data[`pkg_price_${idx}`] = birr_price;
        keyboard_buttons.push({ text: display_text, callback_data: `pkg_idx:${idx}` });
      }
      let grid = [];
      if (selection === "premium") grid = keyboard_buttons.map(btn => [btn]);
      else {
        for (let i = 0; i < keyboard_buttons.length; i += 2) grid.push(keyboard_buttons.slice(i, i + 2));
      }
      grid.push([{ text: "Back", callback_data: "back_to_service", icon_custom_emoji_id: ID_BACK, style: "danger" }]);
      session.state = STATE_SELECT_PKG;
      await sendOrEdit(ctx, `${EMOJI_ORDER} <b>Select a package:</b>`, { reply_markup: { inline_keyboard: grid } });
      return;
    }
    if (data.startsWith("pkg_idx:")) {
      const idx = parseInt(data.split(":")[1], 10);
      const packages = session.data.active_packages;
      if (!packages || idx >= packages.length) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Package unavailable.`, { reply_markup: get_main_inline_keyboard() });
        clearUserSession(userId);
        return;
      }
      const pkg = packages[idx];
      const raw_name = (session.data.package_raw_names && session.data.package_raw_names[String(idx)]) || pkg.name || pkg.title || "Item";
      const api_price = parseFloat(pkg.unit_price || pkg.price || pkg.amount || 0.0);
      const markup = session.data.telegram_markup || 0.0;
      const charged_price = session.data[`pkg_price_${idx}`] !== undefined ? session.data[`pkg_price_${idx}`] : api_price_to_birr(api_price, markup);
      const clean_name = get_clean_telegram_name(raw_name);
      session.data.selected_pkg_id = pkg.id || pkg.code;
      session.data.package_name = raw_name;
      session.data.package_display_name = clean_name;
      session.data.api_price = api_price;
      session.data.charged_price = charged_price;
      session.data.markup = markup;
      session.data.service_name = pkg.service || "Direct Top-Up";
      session.state = STATE_ENTER_UID;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      const prompt = `${EMOJI_USER} <b>Enter recipient's Telegram username</b> (with @) for <b>${clean_name}</b>:\n<i>The API will verify it and return their Telegram name.</i>`;
      await sendOrEdit(ctx, prompt, { reply_markup: cancel_kb });
      return;
    }
    if (data === "order_confirm") {
      session.state = STATE_PAYMENT_METHOD;
      const kb = {
        inline_keyboard: [
          [{ text: "Pay from Wallet", callback_data: "pay_method:wallet", icon_custom_emoji_id: ID_WALLET, style: "primary" }],
          [
            { text: "CBE", callback_data: "pay_method:cbe", icon_custom_emoji_id: ID_CBE, style: "primary" },
            { text: "Telebirr", callback_data: "pay_method:telebirr", icon_custom_emoji_id: ID_TELEBIRR, style: "primary" }
          ],
          [{ text: "Cancel", callback_data: "order_cancel", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]
        ]
      };
      await sendOrEdit(ctx, `${EMOJI_WALLET} <b>Choose a payment method</b>`, { reply_markup: kb });
      return;
    }
    if (data.startsWith("pay_method:")) {
      const method = data.split(":")[1];
      session.data.pay_method = method;
      if (method === "wallet") {
        const profile = await db.get_user_profile(userId);
        const balance = profile.balance || 0.0;
        const charged_price = session.data.charged_price || 0.0;
        if (balance < charged_price) {
          await sendOrEdit(ctx,
            `${EMOJI_CROSS} <b>Insufficient Balance</b>\nRequired: ${Math.floor(charged_price)}ETB\nYour Balance: ${Math.floor(balance)}ETB`,
            { reply_markup: get_main_inline_keyboard() }
          );
          clearUserSession(userId);
          return;
        }
        if (!(await db.can_place_order(userId, appSettings.MAX_DAILY_ORDERS))) {
          await sendOrEdit(ctx, `${EMOJI_CROSS} You have reached the daily order limit.`, { reply_markup: get_main_inline_keyboard() });
          clearUserSession(userId);
          return;
        }
        await sendOrEdit(ctx, "⏳ Processing order...");
        await place_order_flow(ctx, session, db, api_client, bot, "wallet");
        return;
      } else if (method === "cbe" || method === "telebirr") {
        const charged_price = session.data.charged_price || 0.0;
        let account_name, account_number, instructions, example, image_to_send;
        if (method === "cbe") {
          account_name = CBE_RECEIVER_NAME;
          account_number = CBE_PHONE;
          instructions = "After the payment, reply with the <b>Transaction Link</b> (URL) from your CBE payment.";
          example = "Example: <code>https://... </code>";
          image_to_send = IMG_CBE_TRANSACTION_ID;
        } else {
          account_name = EXPECTED_RECEIVER_NAME;
          account_number = TELEBIRR_PHONE;
          instructions = "After the payment, reply with the <b>Transaction ID</b>.";
          example = "Example: <code>DG56K96NIK</code>";
          image_to_send = IMG_TRANSACTION_ID;
        }
        const caption =
          `${EMOJI_WALLET} <b>Pay ${Math.floor(charged_price)} ETB via ${method.toUpperCase()}</b>\n\n` +
          `Send <b>${Math.floor(charged_price)} ETB</b> to:\n` +
          `Name: <b>${account_name}</b>\n` +
          `Number: <code>${account_number}</code>\n\n` +
          `${instructions}\n${example}`;
        session.state = STATE_PAYMENT_TXN_ID;
        const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "order_cancel", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
        await clear_last_photo(ctx, session);
        await sendOrEditPhoto(ctx, image_to_send, caption, { reply_markup: cancel_kb });
        return;
      }
    }
    if (data === "order_cancel") {
      await clear_last_photo(ctx, session);
      const pkg = session.data.package_display_name || session.data.package_name || "?";
      const price = session.data.charged_price || 0.0;
      clearUserSession(userId);
      await sendOrEdit(ctx, `${EMOJI_CROSS} Order cancelled.`, { reply_markup: get_main_inline_keyboard() });
      await report_event(bot,
        `${EMOJI_CROSS} <b>Order Cancelled</b> (user)\n${EMOJI_USER} <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name || "User"}</a> (ID: <code>${ctx.from.id}</code>)\n${EMOJI_ORDER} ${pkg}\n${EMOJI_MONEY} ${Math.floor(price)} ETB`
      );
      return;
    }
    if (data === "order_back") {
      await clear_last_photo(ctx, session);
      session.state = STATE_ENTER_UID;
      const package_name = session.data.package_display_name || session.data.package_name || "package";
      const prompt = `${EMOJI_USER} Enter recipient's username for ${package_name}:`;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await sendOrEdit(ctx, prompt, { reply_markup: cancel_kb });
      return;
    }
    // ---------- Deposit Flow ----------
    if (data === "menu_deposit") {
      if (!(await maintenance_check(ctx))) return;
      if (!(await check_channel_membership(ctx))) return;
      await register_user_implicit(ctx, db, bot);
      await clear_last_photo(ctx, session);
      session.state = STATE_DEPOSIT_AMOUNT;
      await sendOrEdit(ctx, `${EMOJI_DEPOSIT} <b>Choose a deposit method</b>\n\nSelect how you'd like to add funds to your balance.`, { reply_markup: get_deposit_keyboard() });
      return;
    }
    if (data.startsWith("dep_method:")) {
      const method = data.split(":")[1];
      session.data.dep_method = method;
      session.state = STATE_DEPOSIT_AMOUNT;
      const isCbe = method === "cbe";
      const title = isCbe ? `${EMOJI_CBE} <b>Deposit via CBE</b>` : `${EMOJI_DEPOSIT} <b>Deposit via Telebirr</b>`;
      const text =
        `${title}\n\n` +
        `Please enter the amount (in ETB) you wish to deposit.\n` +
        `Minimum: <b>${MIN_DEPOSIT_BIRR} ETB</b>\n` +
        `Maximum: <b>${appSettings.MAX_DEPOSIT_LIMIT} ETB</b>`;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await sendOrEdit(ctx, text, { reply_markup: cancel_kb });
      return;
    }
    // ---------- Withdraw Flow ----------
    if (data === "menu_withdraw") {
      if (!(await maintenance_check(ctx))) return;
      if (!(await check_channel_membership(ctx))) return;
      await register_user_implicit(ctx, db, bot);
      await clear_last_photo(ctx, session);
      const profile = await db.get_user_profile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      if (available < MIN_WITHDRAW_BIRR) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Minimum withdrawal is ${MIN_WITHDRAW_BIRR} ETB.\nYour withdrawable balance (non-referral) is ${Math.floor(available)} ETB.`, { reply_markup: get_main_inline_keyboard() });
        return;
      }
      session.state = STATE_WITHDRAW_ACCOUNT;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await sendOrEdit(ctx, `${EMOJI_TELEBIRR} <b>Enter your Telebirr account number / phone:</b>\n(e.g., 0967197797)`, { reply_markup: cancel_kb });
      return;
    }
    if (data === "withdraw_confirm") {
      const user = ctx.from;
      const amount = session.data.withdraw_amount;
      const fee = session.data.withdraw_fee || 0;
      const method = session.data.withdraw_method || "telebirr";
      const account = session.data.withdraw_account;
      const nickname = session.data.withdraw_nickname || "N/A";
      const profile = await db.get_user_profile(user.id);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      if ((amount + fee) > available) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Balance changed.`, { reply_markup: get_main_inline_keyboard() });
        clearUserSession(userId);
        return;
      }
      const withdrawal_id = await db.create_withdrawal(user.id, method, amount, "ETB", account, nickname, fee);
      const caption =
        `${EMOJI_WITHDRAW} <b>New Withdrawal Request</b>\n` +
        `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>\n` +
        `${EMOJI_TELEBIRR} Account: ${account}\n` +
        `${EMOJI_USER} Nickname: ${nickname}\n` +
        `${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n` +
        `${EMOJI_MONEY} Fee: ${Math.floor(fee)} ETB\n` +
        `🆔 Withdrawal ID: <code>${format_withdrawal_id(withdrawal_id)}</code>`;
      const admin_kb = { inline_keyboard: [[ { text: "Approve", callback_data: `admin_approve_wth:${withdrawal_id}`, icon_custom_emoji_id: ID_CONFIRM }, { text: "Decline", callback_data: `admin_decline_wth:${withdrawal_id}`, icon_custom_emoji_id: ID_CANCEL } ] ] };
      for (const admin_id of ADMIN_CHAT_IDS) {
        try {
          await bot.telegram.sendMessage(admin_id, caption, { parse_mode: "HTML", reply_markup: admin_kb });
        } catch (e) { logger.error(`Could not send withdrawal notification to admin ${admin_id}: ${e.message}`); }
      }
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Withdrawal request submitted!\nAmount: ${Math.floor(amount)} ETB to ${account}`, { reply_markup: get_main_inline_keyboard() });
      await report_event(bot,
        `${EMOJI_WITHDRAW} <b>New Withdrawal Request</b>\n${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n${EMOJI_TELEBIRR} Account: ${account}\n🆔 Withdrawal ID: <code>${format_withdrawal_id(withdrawal_id)}</code>`
      );
      clearUserSession(userId);
      return;
    }
    if (data === "withdraw_cancel") {
      clearUserSession(userId);
      await sendOrEdit(ctx, `${EMOJI_CROSS} Withdrawal cancelled.`, { reply_markup: get_main_inline_keyboard() });
      return;
    }
    // ---------- Admin Panel Handlers ----------
    if (ADMIN_CHAT_IDS.includes(userId)) {
      if (data.startsWith("admin_approve_dep:")) {
        const deposit_id = data.split(":")[1];
        const success = await db.approve_deposit(deposit_id);
        if (success) {
          const deposit = await db.get_deposit_by_id(deposit_id);
          try {
            await bot.telegram.sendMessage(deposit.user_id, `${EMOJI_SUCCESS} Deposit of ${Math.floor(deposit.amount)} ETB approved!`, { parse_mode: "HTML" });
          } catch (_) {}
          await sendOrEdit(ctx, `${EMOJI_SUCCESS} Deposit ${format_deposit_id(deposit_id)} approved.`);
          await report_event(bot,
            `${EMOJI_SUCCESS} <b>Deposit Approved</b>\n${EMOJI_USER} User ID: <code>${deposit.user_id}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(deposit.amount)} ${deposit.currency || "ETB"}\n${EMOJI_TELEBIRR} Method: ${deposit.method || "?"}\n🆔 Deposit: <code>${format_deposit_id(deposit_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`
          );
        } else {
          await ctx.answerCbQuery("Deposit not found or already processed.", { show_alert: true });
        }
        return;
      }
      if (data.startsWith("admin_decline_dep:")) {
        const deposit_id = data.split(":")[1];
        pending_decline[`dep_${deposit_id}`] = true;
        await sendOrEdit(ctx, `${EMOJI_INFO} Reply to this message with the reason for declining deposit ${format_deposit_id(deposit_id)}:`);
        await report_event(bot,
          `${EMOJI_CROSS} <b>Deposit Declined</b> (pending reason)\n🆔 Deposit: <code>${format_deposit_id(deposit_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`
        );
        return;
      }
      if (data.startsWith("admin_approve_wth:")) {
        const w_id = data.split(":")[1];
        const success = await db.approve_withdrawal(w_id, "", userId);
        if (success) {
          const w = await db.get_withdrawal_by_id(w_id);
          try {
            await bot.telegram.sendMessage(w.user_id, `${EMOJI_SUCCESS} Withdrawal of ${Math.floor(w.amount)} ETB to ${w.account} approved!`, { parse_mode: "HTML" });
          } catch (_) {}
          await sendOrEdit(ctx, `${EMOJI_SUCCESS} Withdrawal ${format_withdrawal_id(w_id)} approved.`);
          await report_event(bot,
            `${EMOJI_SUCCESS} <b>Withdrawal Approved</b>\n${EMOJI_USER} User ID: <code>${w.user_id}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(w.amount)} ETB\n${EMOJI_TELEBIRR} Account: ${w.account}\n🆔 Withdrawal: <code>${format_withdrawal_id(w_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`
          );
        } else {
          await ctx.answerCbQuery("Withdrawal not found or already processed.", { show_alert: true });
        }
        return;
      }
      if (data.startsWith("admin_decline_wth:")) {
        const w_id = data.split(":")[1];
        pending_decline[`wth_${w_id}`] = true;
        await report_event(bot,
          `${EMOJI_CROSS} <b>Withdrawal Declined</b> (pending reason)\n🆔 Withdrawal: <code>${format_withdrawal_id(w_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`
        );
        await sendOrEdit(ctx, `${EMOJI_INFO} Reply to this message with the reason for declining withdrawal ${format_withdrawal_id(w_id)}:`);
        return;
      }
      if (data === "admin_dashboard") {
        const stats = await db.get_dashboard_stats();
        const dashboard_text =
          `${EMOJI_INFO} <b>Dashboard</b>\n\n` +
          `${EMOJI_USER} Total Users: ${stats.total_users}\n` +
          `${EMOJI_MONEY} Total Deposits: ${stats.total_deposits} (Amount: ${Math.floor(stats.total_deposit_amount)} ETB)\n` +
          `${EMOJI_CLOCK} Pending Deposits: ${stats.pending_deposits}\n` +
          `${EMOJI_MONEY} Total Withdrawals: ${stats.total_withdrawals} (Amount: ${Math.floor(stats.total_withdrawal_amount)} ETB)\n` +
          `${EMOJI_CLOCK} Pending Withdrawals: ${stats.pending_withdrawals}\n` +
          `${EMOJI_ORDER} Total Orders: ${stats.total_orders}\n` +
          `${EMOJI_MONEY} Today's Revenue: ${Math.floor(stats.revenue_today)} ETB\n` +
          `${EMOJI_INFO} Maintenance: ${appSettings.MAINTENANCE_MODE ? "ON" : "OFF"}`;
        await sendOrEdit(ctx, dashboard_text, { reply_markup: get_admin_keyboard() });
        return;
      }
      if (data === "admin_deposits") {
        const pending = await db.get_pending_deposits();
        if (!pending.length) {
          await sendOrEdit(ctx, `${EMOJI_INFO} No pending deposits.`, { reply_markup: get_admin_keyboard() });
          return;
        }
        let text = `${EMOJI_MONEY} <b>Pending Deposits</b>\n\n`;
        for (const dep of pending) {
          text += `🆔 <code>${format_deposit_id(dep.id)}</code> | User: ${dep.user_id}\nAmount: ${Math.floor(dep.amount)} ETB | Method: ${dep.method}\nDate: ${(dep.created_at || "").slice(0, 10)}\n\n`;
        }
        const keyboard = pending.map(dep => [
          { text: `Approve ${format_deposit_id(dep.id)}`, callback_data: `admin_approve_dep:${dep.id}`, icon_custom_emoji_id: ID_CONFIRM },
          { text: `Decline ${format_deposit_id(dep.id)}`, callback_data: `admin_decline_dep:${dep.id}`, icon_custom_emoji_id: ID_CANCEL }
        ]);
        keyboard.push([{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]);
        await sendOrEdit(ctx, text, { reply_markup: { inline_keyboard: keyboard } });
        return;
      }
      if (data === "admin_withdrawals") {
        const pending = await db.get_pending_withdrawals();
        if (!pending.length) {
          await sendOrEdit(ctx, `${EMOJI_INFO} No pending withdrawals.`, { reply_markup: get_admin_keyboard() });
          return;
        }
        let text = `${EMOJI_MONEY} <b>Pending Withdrawals</b>\n\n`;
        for (const w of pending) {
          text += `🆔 <code>${format_withdrawal_id(w.id)}</code> | User: ${w.user_id}\nAmount: ${Math.floor(w.amount)} ETB | Account: ${w.account}\nNickname: ${w.nickname} | Fee: ${Math.floor(w.fee || 0)} ETB\nDate: ${(w.created_at || "").slice(0, 10)}\n\n`;
        }
        const keyboard = pending.map(w => [
          { text: `Approve ${format_withdrawal_id(w.id)}`, callback_data: `admin_approve_wth:${w.id}`, icon_custom_emoji_id: ID_CONFIRM },
          { text: `Decline ${format_withdrawal_id(w.id)}`, callback_data: `admin_decline_wth:${w.id}`, icon_custom_emoji_id: ID_CANCEL }
        ]);
        keyboard.push([{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]);
        await sendOrEdit(ctx, text, { reply_markup: { inline_keyboard: keyboard } });
        return;
      }
      if (data === "admin_promo") {
        await sendOrEdit(ctx, `${EMOJI_MONEY} <b>Promo Codes Management</b>`, { reply_markup: get_admin_promo_keyboard() });
        return;
      }
      if (data === "admin_promo_create") {
        session.state = STATE_ADMIN_CREATE_CODE;
        await sendOrEdit(ctx, `${EMOJI_ADD} <b>Create Promo Code</b>\n\nFormat: <code>amount [max_uses] [code]</code>`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_promo_list") {
        const codes = await db.list_promo_codes();
        let text;
        if (!codes.length) text = `${EMOJI_INFO} No active promo codes.`;
        else {
          text = `${EMOJI_MONEY} <b>Active Promo Codes</b>\n\n`;
          for (const c of codes) text += `<code>${c.code}</code>: ${Math.floor(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
        }
        await sendOrEdit(ctx, text, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_promo_delete") {
        session.state = STATE_ADMIN_DELETE_CODE;
        await sendOrEdit(ctx, `${EMOJI_DELETE} <b>Delete Promo Code</b>\n\nReply with the code (or use /delcode):`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_broadcast") {
        session.state = STATE_ADMIN_BROADCAST;
        await sendOrEdit(ctx, `${EMOJI_MEGAPHONE} <b>Broadcast Message</b>\n\nReply with the message you want to send to all users:`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_referral") {
        session.state = STATE_ADMIN_REFERRAL_INPUT;
        await sendOrEdit(ctx, `${EMOJI_USER} <b>Referral Lookup</b>\n\nEnter the user's Telegram ID:`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_search_by_id") {
        await sendOrEdit(ctx, `${EMOJI_SEARCH} <b>Search by ID</b>\n\nSelect the type:`, { reply_markup: get_search_by_id_keyboard() });
        return;
      }
      if (data.startsWith("admin_search_id:")) {
        const search_type = data.split(":")[1];
        session.data.admin_search_type = search_type;
        session.state = STATE_ADMIN_SEARCH_BY_ID;
        await sendOrEdit(ctx, `${EMOJI_SEARCH} <b>Search ${search_type.toUpperCase()}</b>\n\nEnter the ID (any format):`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_search_by_id", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_settings") {
        await sendOrEdit(ctx, `${EMOJI_SETTINGS} <b>Settings & Tools</b>`, { reply_markup: get_admin_settings_keyboard() });
        return;
      }
      if (data === "admin_user_manage") {
        await sendOrEdit(ctx, `${EMOJI_USER} <b>User Management</b>`, { reply_markup: get_user_manage_keyboard() });
        return;
      }
      if (data === "admin_ban") {
        session.state = STATE_ADMIN_BAN;
        await sendOrEdit(ctx, `${EMOJI_BAN} <b>Ban User</b>\n\nEnter the user's Telegram ID:`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_user_manage", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_unban") {
        session.state = STATE_ADMIN_UNBAN;
        await sendOrEdit(ctx, `${EMOJI_UNBAN} <b>Unban User</b>\n\nEnter the user's Telegram ID:`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_user_manage", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_set_balance") {
        session.state = STATE_ADMIN_SETBALANCE;
        await sendOrEdit(ctx, `${EMOJI_MONEY} <b>Set Balance</b>\n\nEnter: <code>user_id amount</code>`, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_user_manage", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_set_product_price") {
        const kb = {
          inline_keyboard: [
            [{ text: "Telegram Stars", callback_data: "admin_price_type:stars", icon_custom_emoji_id: ID_STAR }],
            [{ text: "Telegram Premium", callback_data: "admin_price_type:premium", icon_custom_emoji_id: ID_PREMIUM }],
            [{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]
          ]
        };
        await sendOrEdit(ctx, "Select product type to set price:", { reply_markup: kb });
        return;
      }
      if (data.startsWith("admin_price_type:")) {
        const ptype = data.split(":")[1];
        session.data.admin_price_type = ptype;
        let packages;
        if (ptype === "stars") packages = await catalog_service.get_telegram_stars_packages();
        else packages = await catalog_service.get_telegram_premium_plans();
        if (!packages.length) {
          await sendOrEdit(ctx, "No packages found.", { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
          return;
        }
        const kb_buttons = [];
        for (const pkg of packages) {
          const name = pkg.name || pkg.title || "Package";
          let price = pkg._override_price;
          if (price === undefined || price === null) {
            const api_price = parseFloat(pkg.unit_price || pkg.price || pkg.amount || 0.0);
            const markup = ptype === "stars" ? await catalog_service.get_telegram_stars_markup() : await catalog_service.get_telegram_premium_markup();
            price = api_price_to_birr(api_price, markup);
          }
          const product_id = pkg.id || pkg.code || pkg.name;
          kb_buttons.push([{ text: `${name} - ${Math.floor(price)} ETB`, callback_data: `admin_price_select:${product_id}` }]);
        }
        kb_buttons.push([{ text: "Back", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]);
        await sendOrEdit(ctx, "Select package to set price:", { reply_markup: { inline_keyboard: kb_buttons } });
        return;
      }
      if (data.startsWith("admin_price_select:")) {
        const product_id = data.split(":")[1];
        session.data.admin_price_product_id = product_id;
        session.state = STATE_ADMIN_SET_PRICE_INPUT;
        await sendOrEdit(ctx, "Enter new price in ETB for this product (or 0 to remove override):", { reply_markup: { inline_keyboard: [[{ text: "Cancel", callback_data: "admin_back", icon_custom_emoji_id: ID_BACK }]] } });
        return;
      }
      if (data === "admin_toggle_maintenance") {
        appSettings.MAINTENANCE_MODE = !appSettings.MAINTENANCE_MODE;
        await db.save_setting("maintenance_mode", appSettings.MAINTENANCE_MODE ? "1" : "0", appSettings);
        await sendOrEdit(ctx, `${EMOJI_TOGGLE} Maintenance mode has been ${appSettings.MAINTENANCE_MODE ? "ENABLED" : "DISABLED"}.`, { reply_markup: get_admin_settings_keyboard() });
        return;
      }
      if (data === "admin_toggle_reports") {
        appSettings.REPORT_EVENTS = !appSettings.REPORT_EVENTS;
        await db.save_setting("report_events", appSettings.REPORT_EVENTS ? "1" : "0", appSettings);
        await sendOrEdit(ctx, `${EMOJI_TOGGLE} Reports have been ${appSettings.REPORT_EVENTS ? "ENABLED" : "DISABLED"}.`, { reply_markup: get_admin_settings_keyboard() });
        return;
      }
      if (data === "admin_stars_markup") {
        session.state = STATE_ADMIN_STARS_MARKUP;
        await sendOrEdit(ctx,
          `${EMOJI_STAR} <b>Set Telegram Stars Markup</b>\n\nCurrent: <b>${Math.floor(appSettings.TELEGRAM_STARS_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`,
          { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_settings", icon_custom_emoji_id: ID_BACK }]] } }
        );
        return;
      }
      if (data === "admin_premium_markup") {
        session.state = STATE_ADMIN_PREMIUM_MARKUP;
        await sendOrEdit(ctx,
          `${EMOJI_PREMIUM} <b>Set Telegram Premium Markup</b>\n\nCurrent: <b>${Math.floor(appSettings.TELEGRAM_PREMIUM_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`,
          { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "admin_settings", icon_custom_emoji_id: ID_BACK }]] } }
        );
        return;
      }
      if (data === "admin_back") {
        await sendOrEdit(ctx, `${EMOJI_INFO} <b>Admin Panel</b>`, { reply_markup: get_admin_keyboard() });
        return;
      }
      if (data === "admin_close") {
        clearUserSession(userId);
        await sendOrEdit(ctx, "Admin panel closed.");
        return;
      }
    }
  });

  // ---------- Message Handler ----------
  bot.on('message', async (ctx) => {
    ctx.deleteMessage().catch(() => {});
    const text = ctx.message.text ? ctx.message.text.trim() : "";
    const userId = ctx.from.id;
    const session = getUserSession(userId);

    // Admin reply to decline
    if (ctx.message.reply_to_message && ADMIN_CHAT_IDS.includes(userId)) {
      const keys = Object.keys(pending_decline);
      if (keys.length) {
        const key = keys[keys.length - 1];
        const reason = text || "No reason given";
        if (key.startsWith("dep_")) {
          const depId = key.replace("dep_", "");
          const success = await db.reject_deposit(depId, reason);
          if (success) {
            const deposit = await db.get_deposit_by_id(depId);
            try {
              await bot.telegram.sendMessage(deposit.user_id, `${EMOJI_CROSS} Deposit rejected: ${reason}`, { parse_mode: "HTML" });
            } catch (_) {}
            await sendOrEdit(ctx, `${EMOJI_CROSS} Deposit rejected.`);
          } else {
            await sendOrEdit(ctx, "Failed to reject deposit.");
          }
        } else if (key.startsWith("wth_")) {
          const wId = key.replace("wth_", "");
          const success = await db.reject_withdrawal(wId, reason, userId);
          if (success) {
            const w = await db.get_withdrawal_by_id(wId);
            try {
              await bot.telegram.sendMessage(w.user_id, `${EMOJI_CROSS} Withdrawal of ${Math.floor(w.amount)} ETB rejected: ${reason}`, { parse_mode: "HTML" });
            } catch (_) {}
            await sendOrEdit(ctx, `${EMOJI_CROSS} Withdrawal rejected.`);
          } else {
            await sendOrEdit(ctx, "Failed to reject withdrawal.");
          }
        }
        delete pending_decline[key];
        return;
      }
    }

    if (session.state === STATE_ADMIN_LOGIN) {
      if (text === ADMIN_PASSWORD) {
        session.state = STATE_ADMIN_MAIN;
        await sendOrEdit(ctx, `${EMOJI_SUCCESS} Access granted.`, { reply_markup: get_admin_keyboard() });
      } else {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Incorrect password. Try again or /cancel.`);
      }
      return;
    }
    if (session.state === STATE_ADMIN_BROADCAST) {
      if (["cancel", "back"].includes(text.toLowerCase())) {
        session.state = STATE_ADMIN_MAIN;
        await sendOrEdit(ctx, `${EMOJI_CANCEL} Cancelled.`, { reply_markup: get_admin_keyboard() });
        return;
      }
      const users = await db.get_all_users();
      let success = 0;
      for (const uid of users) {
        try {
          await bot.telegram.sendMessage(uid, text);
          success++;
        } catch (_) {}
      }
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Broadcast sent to ${success}/${users.length} users.`, { reply_markup: get_admin_keyboard() });
      await report_event(bot,
        `${EMOJI_MEGAPHONE} <b>Broadcast Sent</b>\n${EMOJI_MAIL} Delivered: ${success}/${users.length}\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)\n\n<b>Message:</b>\n${text.slice(0, 600)}`
      );
      return;
    }
    if (session.state === STATE_ADMIN_CREATE_CODE) {
      const args = text.split(/\s+/);
      const amount = parseFloat(args[0]);
      if (isNaN(amount)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid amount.`);
        return;
      }
      const max_uses = args.length > 1 ? parseInt(args[1], 10) : 1;
      const code = args.length > 2 ? args[2].toUpperCase() : uuidv4().slice(0, 8).toUpperCase();
      const success = await db.create_promo_code(code, amount, max_uses);
      session.state = STATE_ADMIN_MAIN;
      if (success) {
        await sendOrEdit(ctx, `${EMOJI_SUCCESS} Code <b>${code}</b> created for ${Math.floor(amount)} ETB, uses: ${max_uses}`, { reply_markup: get_admin_keyboard() });
        await report_event(bot,
          `${EMOJI_MONEY} <b>Promo Code Created</b>\n${EMOJI_INFO} Code: <code>${code}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n${EMOJI_INFO} Max uses: ${max_uses}\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`
        );
      } else {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Code already exists.`, { reply_markup: get_admin_keyboard() });
      }
      return;
    }
    if (session.state === STATE_ADMIN_DELETE_CODE) {
      const code = text.toUpperCase();
      await db.delete_promo_code(code);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Code <b>${code}</b> deleted.`, { reply_markup: get_admin_keyboard() });
      await report_event(bot,
        `${EMOJI_MONEY} <b>Promo Code Deleted</b>\n${EMOJI_INFO} Code: <code>${code}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`
      );
      return;
    }
    if (session.state === STATE_ADMIN_REFERRAL_INPUT) {
      if (["cancel", "back"].includes(text.toLowerCase())) {
        session.state = STATE_ADMIN_MAIN;
        await sendOrEdit(ctx, `${EMOJI_CANCEL} Cancelled.`, { reply_markup: get_admin_keyboard() });
        return;
      }
      const targetUid = parseInt(text, 10);
      if (isNaN(targetUid)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid ID.`);
        return;
      }
      const [total, rewarded, total_reward] = await db.get_referral_stats(targetUid);
      const referrals = await db.get_referral_list(targetUid);
      let msg = `${EMOJI_INFO} <b>Referral Stats for ID <code>${targetUid}</code></b>\n\n`;
      msg += `${EMOJI_USER} Total invited: <b>${total}</b>\n`;
      msg += `${EMOJI_MONEY} Rewarded: <b>${rewarded}</b>\n`;
      msg += `${EMOJI_MONEY} Total earned: <b>${Math.floor(total_reward)} ETB</b>\n\n`;
      if (referrals.length) {
        msg += "<b>Recent invites:</b>\n";
        for (const r of referrals) {
          const status_icon = r.reward_given ? EMOJI_SUCCESS : EMOJI_CLOCK;
          msg += `  ${status_icon} <code>${r.referred_id}</code> (${r.status}) – ${(r.created_at || "").slice(0, 10)}\n`;
        }
      } else {
        msg += "<i>No invites yet.</i>";
      }
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, msg, { reply_markup: get_admin_keyboard() });
      return;
    }
    if (session.state === STATE_ADMIN_BAN) {
      const targetUid = parseInt(text, 10);
      if (isNaN(targetUid)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid ID.`);
        return;
      }
      await db.ban_user(targetUid);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_BAN} User <code>${targetUid}</code> banned.`, { reply_markup: get_admin_keyboard() });
      await report_event(bot,
        `${EMOJI_BAN} <b>User Banned</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`
      );
      return;
    }
    if (session.state === STATE_ADMIN_UNBAN) {
      const targetUid = parseInt(text, 10);
      if (isNaN(targetUid)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid ID.`);
        return;
      }
      await db.unban_user(targetUid);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_UNBAN} User <code>${targetUid}</code> unbanned.`, { reply_markup: get_admin_keyboard() });
      await report_event(bot,
        `${EMOJI_UNBAN} <b>User Unbanned</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`
      );
      return;
    }
    if (session.state === STATE_ADMIN_SETBALANCE) {
      const parts = text.split(/\s+/);
      if (parts.length !== 2) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Format: user_id amount`);
        return;
      }
      const targetUid = parseInt(parts[0], 10);
      const amount = parseFloat(parts[1]);
      if (isNaN(targetUid) || isNaN(amount)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid numbers.`);
        return;
      }
      await db.set_balance(targetUid, amount);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_MONEY} Balance of <code>${targetUid}</code> set to <b>${Math.floor(amount)} ETB</b>.`, { reply_markup: get_admin_keyboard() });
      await report_event(bot,
        `${EMOJI_MONEY} <b>Balance Set by Admin</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_MONEY} New balance: <b>${Math.floor(amount)} ETB</b>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`
      );
      return;
    }
    if (session.state === STATE_ADMIN_STARS_MARKUP) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < 0) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid number. Please enter a valid ETB amount (>= 0).`);
        return;
      }
      appSettings.TELEGRAM_STARS_MARKUP = amount;
      await db.save_setting("telegram_stars_markup", String(amount), appSettings);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Telegram Stars markup set to <b>${Math.floor(amount)} ETB</b>.`, { reply_markup: get_admin_keyboard() });
      return;
    }
    if (session.state === STATE_ADMIN_PREMIUM_MARKUP) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < 0) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Invalid number. Please enter a valid ETB amount (>= 0).`);
        return;
      }
      appSettings.TELEGRAM_PREMIUM_MARKUP = amount;
      await db.save_setting("telegram_premium_markup", String(amount), appSettings);
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Telegram Premium markup set to <b>${Math.floor(amount)} ETB</b>.`, { reply_markup: get_admin_keyboard() });
      return;
    }
    if (session.state === STATE_ADMIN_SET_PRICE_INPUT) {
      const newPrice = parseFloat(text);
      if (isNaN(newPrice)) {
        await sendOrEdit(ctx, "❌ Invalid number. Please enter a valid amount (e.g., 150).");
        return;
      }
      const productId = session.data.admin_price_product_id;
      const ptype = session.data.admin_price_type || "stars";
      if (newPrice <= 0) {
        await db.set_product_price_override(productId, null, ptype);
        await sendOrEdit(ctx, "✅ Price override removed for product.");
      } else {
        await db.set_product_price_override(productId, newPrice, ptype);
        await sendOrEdit(ctx, `✅ Price set to ${Math.floor(newPrice)} ETB for product.`);
      }
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, "Returning to admin panel.", { reply_markup: get_admin_keyboard() });
      return;
    }
    if (session.state === STATE_ADMIN_SEARCH_BY_ID) {
      const search_type = session.data.admin_search_type;
      let result_text = "";
      if (search_type === "order") {
        let order = null;
        if (/^\d+$/.test(text)) order = await db.get_order_by_numeric_id(parseInt(text, 10));
        if (!order) order = await db.get_order_by_id(text);
        if (order) {
          const uname = (await db.get_username(order.telegram_id)) || "Unknown";
          result_text =
            `${EMOJI_ORDER} <b>Order Details</b>\n\n` +
            `🆔 Order ID: <code>${order.order_id}</code>\n` +
            `${EMOJI_USER} User: <code>${order.telegram_id}</code> (@${uname})\n` +
            `${EMOJI_GAME} Game: ${order.game}\n` +
            `${EMOJI_ORDER} Package: ${order.package_name}\n` +
            `${EMOJI_MONEY} Charged: ${Math.floor(order.charged_price)} ETB\n` +
            `${EMOJI_SUCCESS} Status: ${order.status}\n` +
            `${EMOJI_CALENDAR} Created: ${order.created_at}`;
        } else result_text = `${EMOJI_CROSS} Order not found.`;
      } else if (search_type === "deposit") {
        let deposit = null;
        if (/^\d+$/.test(text)) deposit = await db.get_deposit_by_id(text);
        if (deposit) {
          const uname = (await db.get_username(deposit.user_id)) || "Unknown";
          result_text =
            `${EMOJI_MONEY} <b>Deposit Details</b>\n\n` +
            `🆔 Deposit ID: <code>${format_deposit_id(deposit.id)}</code>\n` +
            `${EMOJI_USER} User: <code>${deposit.user_id}</code> (@${uname})\n` +
            `${EMOJI_MONEY} Amount: ${Math.floor(deposit.amount)} ${deposit.currency}\n` +
            `${EMOJI_TELEBIRR} Method: ${deposit.method}\n` +
            `${EMOJI_SUCCESS} Status: ${deposit.status}\n` +
            `${EMOJI_CALENDAR} Created: ${deposit.created_at}\n` +
            `${EMOJI_INFO} Admin Note: ${deposit.admin_note || "N/A"}`;
        } else result_text = `${EMOJI_CROSS} Deposit not found.`;
      } else if (search_type === "withdrawal") {
        let withdrawal = await db.get_withdrawal_by_id(text);
        if (!withdrawal && text.toUpperCase().startsWith("EX")) {
          const parsed = parse_formatted_id(text);
          if (parsed) withdrawal = await db.get_withdrawal_by_id(parsed);
        }
        if (!withdrawal && /^\d+$/.test(text)) withdrawal = await db.get_withdrawal_by_id(`WTH-${text}`);
        if (withdrawal && Object.keys(withdrawal).length) {
          const uname = (await db.get_username(withdrawal.user_id)) || "Unknown";
          result_text =
            `${EMOJI_MONEY} <b>Withdrawal Details</b>\n\n` +
            `🆔 Withdrawal ID: <code>${format_withdrawal_id(withdrawal.id)}</code>\n` +
            `${EMOJI_USER} User: <code>${withdrawal.user_id}</code> (@${uname})\n` +
            `${EMOJI_MONEY} Amount: ${Math.floor(withdrawal.amount)} ${withdrawal.currency}\n` +
            `${EMOJI_TELEBIRR} Account: ${withdrawal.account}\n` +
            `${EMOJI_USER} Nickname: ${withdrawal.nickname}\n` +
            `${EMOJI_MONEY} Fee: ${Math.floor(withdrawal.fee || 0)} ETB\n` +
            `${EMOJI_SUCCESS} Status: ${withdrawal.status}\n` +
            `${EMOJI_CALENDAR} Created: ${withdrawal.created_at}\n` +
            `${EMOJI_INFO} Admin Note: ${withdrawal.admin_note || "N/A"}`;
        } else result_text = `${EMOJI_CROSS} Withdrawal not found.`;
      }
      session.state = STATE_ADMIN_MAIN;
      await sendOrEdit(ctx, result_text, { reply_markup: get_admin_keyboard() });
      return;
    }
    if (session.state === STATE_PROFILE_REDEEM) {
      if (!(await maintenance_check(ctx))) return;
      if (!(await check_channel_membership(ctx))) return;
      const [success, amount, errMsg] = await db.use_promo_code(text, userId);
      clearUserSession(userId);
      if (!success) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} ${errMsg}`, { reply_markup: get_main_inline_keyboard() });
        return;
      }
      await db.update_balance(userId, amount);
      await sendOrEdit(ctx, `${EMOJI_SUCCESS} Promo code accepted! <b>${Math.floor(amount)} ETB</b> added to your balance.`, { reply_markup: get_main_inline_keyboard() });
      await report_event(bot,
        `${EMOJI_MONEY} <b>Promo Code Redeemed</b>\n${EMOJI_USER} <a href="tg://user?id=${userId}">${ctx.from.first_name || "User"}</a> (ID: <code>${userId}</code>)\n${EMOJI_INFO} Code: <code>${text.toUpperCase()}</code>\n${EMOJI_MONEY} Amount added: ${Math.floor(amount)} ETB`
      );
      return;
    }
    if (session.state === STATE_ENTER_UID) {
      if (!(await maintenance_check(ctx))) return;
      if (!text.startsWith("@") && text.length < 4) {
        await sendOrEdit(ctx, `${EMOJI_WARNING} Invalid username. Must start with @.`);
        return;
      }
      session.data.player_id = text;
      session.data.nickname = text;
      await sendOrEdit(ctx, "🔍 Resolving Telegram username...");
      let resolved_name = null;
      const game_code = session.data.telegram_game_code || "Telegram";
      try {
        const tg_check = await api_client.check_player_id(game_code, text);
        if (tg_check) {
          const is_valid = tg_check.valid === true || tg_check.valid === "valid" || tg_check.valid === "true" || tg_check.success === true || tg_check.success === "true" || tg_check.success === "ok";
          if (!is_valid) {
            const error_msg = tg_check.message || "Invalid username.";
            await sendOrEdit(ctx, `${EMOJI_CROSS} ${error_msg}\n\nPlease enter a valid username.`);
            return;
          }
          resolved_name = tg_check.name || tg_check.nickname || tg_check.first_name || (tg_check.user && tg_check.user.name) || text.replace(/^@/, '');
        } else {
          resolved_name = text.replace(/^@/, '');
        }
      } catch (e) {
        resolved_name = text.replace(/^@/, '');
      }
      if (resolved_name) session.data.nickname = resolved_name;
      const summary =
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `${EMOJI_ORDER} <b>Order Summary</b>\n\n` +
        `${EMOJI_GAME} <b>Product:</b> ${session.data.game_name}\n` +
        `${EMOJI_ORDER} <b>Service:</b> ${session.data.service_name}\n` +
        `${EMOJI_USER} <b>Name:</b> ${resolved_name || "Unknown"}\n` +
        `${EMOJI_USER} <b>Username:</b> ${text}\n` +
        `${EMOJI_MONEY} <b>Package:</b> ${session.data.package_display_name || session.data.package_name}\n` +
        `${EMOJI_MONEY} <b>Price:</b> ${Math.floor(session.data.charged_price)}ETB\n` +
        "━━━━━━━━━━━━━━━━━━━━━━";
      session.state = STATE_CONFIRM;
      await sendOrEdit(ctx, summary, { reply_markup: get_confirmation_keyboard() });
      return;
    }
    if (session.state === STATE_PAYMENT_TXN_ID) {
      const reference = text.trim();
      const method = session.data.pay_method;
      const charged_price = session.data.charged_price || 0.0;
      if (!reference) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Please enter a valid reference.`);
        return;
      }
      if (await db.is_transaction_used(reference)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} This reference has already been used.`, { reply_markup: get_main_inline_keyboard() });
        clearUserSession(userId);
        return;
      }
      await sendOrEdit(ctx, "⏳ Verifying your payment...");
      const result = await verify_payment(reference, method);
      if (result) {
        const verified_amount = result.amount;
        if (verified_amount < charged_price) {
          await sendOrEdit(ctx,
            `${EMOJI_CROSS} Payment amount (${Math.floor(verified_amount)} ETB) is less than the order total (${Math.floor(charged_price)} ETB).`,
            { reply_markup: get_main_inline_keyboard() }
          );
          clearUserSession(userId);
          return;
        }
        await db.record_transaction_use(reference, userId, verified_amount);
        await place_order_flow(ctx, session, db, api_client, bot, method, reference, verified_amount);
        return;
      } else {
        const attempts = (verify_attempts[userId] || 0) + 1;
        verify_attempts[userId] = attempts;
        if (attempts >= 3) {
          delete verify_attempts[userId];
          clearUserSession(userId);
          await sendOrEdit(ctx, `${EMOJI_CROSS} Verification failed after 3 attempts. Please try again later or contact support.`, { reply_markup: get_main_inline_keyboard() });
        } else {
          await sendOrEdit(ctx, `${EMOJI_CROSS} Not found. ${3 - attempts} tries left.\nRe‑enter the reference.`, { reply_markup: { inline_keyboard: [[{ text: "Cancel", callback_data: "order_cancel", icon_custom_emoji_id: ID_CANCEL }]] } });
        }
        return;
      }
    }
    if (session.state === STATE_DEPOSIT_AMOUNT) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < MIN_DEPOSIT_BIRR) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Minimum deposit is ${MIN_DEPOSIT_BIRR} ETB.`);
        return;
      }
      if (amount > appSettings.MAX_DEPOSIT_LIMIT) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Maximum deposit is ${appSettings.MAX_DEPOSIT_LIMIT} ETB.`);
        return;
      }
      session.data.intended_amount = amount;
      const method = session.data.dep_method || "telebirr";
      let caption, image_to_send;
      if (method === "cbe") {
        caption =
          `${EMOJI_CBE} <b>Send ${Math.floor(amount)} ETB to:</b>\n` +
          `Account: <b>CBE</b>\n` +
          `Number: <code>${CBE_PHONE}</code>\n` +
          `Name: <b>${CBE_RECEIVER_NAME}</b>\n\n` +
          "After the payment, reply with the <b>Transaction Link</b> (URL) from your CBE payment.\n" +
          "Example: <code>https://... </code>";
        image_to_send = IMG_CBE_TRANSACTION_ID;
      } else {
        caption =
          `${EMOJI_TELEBIRR} <b>Send ${Math.floor(amount)} ETB to:</b>\n` +
          `Name: <b>${EXPECTED_RECEIVER_NAME}</b>\n` +
          `Number: <code>${TELEBIRR_PHONE}</code>\n\n` +
          "After the payment, reply with the <b>Transaction ID</b>.\n" +
          "Example: <code>DG56K96NIK</code>";
        image_to_send = IMG_TRANSACTION_ID;
      }
      session.state = STATE_DEPOSIT_TRANSACTION_ID;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await clear_last_photo(ctx, session);
      await sendOrEditPhoto(ctx, image_to_send, caption, { reply_markup: cancel_kb });
      return;
    }
    if (session.state === STATE_DEPOSIT_TRANSACTION_ID) {
      const reference = text.trim();
      const method = session.data.dep_method || "telebirr";
      if (!reference) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Please enter a valid reference (Transaction ID or Link).`);
        return;
      }
      if (await db.is_transaction_used(reference)) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} This reference has already been used.`);
        clearUserSession(userId);
        return;
      }
      await sendOrEdit(ctx, "⏳ Verifying your payment...");
      const result = await verify_payment(reference, method);
      if (result) {
        const amount = result.amount;
        const intended = session.data.intended_amount || amount;
        if (amount < MIN_DEPOSIT_BIRR) {
          await sendOrEdit(ctx, `${EMOJI_CROSS} Amount too low.`, { reply_markup: get_main_inline_keyboard() });
          clearUserSession(userId);
          return;
        }
        const deposit_id = await db.create_deposit(userId, method, amount, "ETB", "");
        await db.approve_deposit(deposit_id, `Auto-approved Ref: ${reference}`);
        await db.record_transaction_use(reference, userId, amount);
        delete verify_attempts[userId];
        await sendOrEdit(ctx, `${EMOJI_SUCCESS} Payment verified! <b>${Math.floor(amount)} ETB</b> added.`);
        if (amount > intended) {
          await sendOrEdit(ctx,
            `${EMOJI_WARNING} You deposited more than you specified (<b>${Math.floor(intended)} ETB</b>). ` +
            `The extra <b>${Math.floor(amount - intended)} ETB</b> has also been added to your balance. ` +
            "If this was a mistake, please withdraw or contact admin."
          );
        }
        await sendOrEdit(ctx, "📸 You may send a screenshot for records.", { reply_markup: get_main_inline_keyboard() });
        const user = ctx.from;
        for (const admin_id of ADMIN_CHAT_IDS) {
          try {
            await bot.telegram.sendMessage(admin_id,
              `${EMOJI_MONEY} <b>Auto‑Approved Deposit</b>\n` +
              `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
              `${EMOJI_MONEY} Amount: <b>${Math.floor(amount)} ETB</b>\n` +
              `🔢 Ref: <code>${reference}</code>\n` +
              `${EMOJI_CALENDAR} ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
              { parse_mode: "HTML" }
            );
          } catch (_) {}
        }
        await report_event(bot,
          `${EMOJI_MONEY} <b>Deposit (Auto)</b>\n` +
          `${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
          `${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n` +
          `🔢 Ref: <code>${reference}</code>`
        );
        clearUserSession(userId);
        return;
      }
      const attempts = (verify_attempts[userId] || 0) + 1;
      verify_attempts[userId] = attempts;
      if (attempts >= 3) {
        delete verify_attempts[userId];
        clearUserSession(userId);
        await sendOrEdit(ctx,
          `${EMOJI_CROSS} Could not verify automatically after 3 tries. Please double‑check the reference and try again later, or contact support.`,
          { reply_markup: get_main_inline_keyboard() }
        );
      } else {
        await sendOrEdit(ctx,
          `${EMOJI_CROSS} Not found. ${3 - attempts} tries left.\nRe‑enter the reference.`,
          { reply_markup: { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL }]] } }
        );
      }
      return;
    }
    if (session.state === STATE_WITHDRAW_ACCOUNT) {
      if (!text) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Please enter a valid account.`);
        return;
      }
      session.data.withdraw_account = text;
      session.state = STATE_WITHDRAW_NICKNAME;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await sendOrEdit(ctx, `${EMOJI_USER} <b>Enter your nickname (shown to admin):</b>`, { reply_markup: cancel_kb });
      return;
    }
    if (session.state === STATE_WITHDRAW_NICKNAME) {
      if (!text) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Please enter your nickname.`);
        return;
      }
      session.data.withdraw_nickname = text;
      const profile = await db.get_user_profile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      session.state = STATE_WITHDRAW_AMOUNT;
      const cancel_kb = { inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_action", icon_custom_emoji_id: ID_CANCEL, style: "danger" }]] };
      await sendOrEdit(ctx,
        `${EMOJI_WITHDRAW} <b>Withdraw via Telebirr</b>\nWithdrawable balance: ${Math.floor(available)} ETB\nMinimum: ${MIN_WITHDRAW_BIRR} ETB\nFee: ${(appSettings.WITHDRAWAL_FEE_PERCENT * 100).toFixed(1)}%\nEnter the amount to withdraw:`,
        { reply_markup: cancel_kb }
      );
      return;
    }
    if (session.state === STATE_WITHDRAW_AMOUNT) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < MIN_WITHDRAW_BIRR) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Minimum ${MIN_WITHDRAW_BIRR} ETB.`);
        return;
      }
      if (amount > appSettings.MAX_WITHDRAW_LIMIT) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Maximum ${appSettings.MAX_WITHDRAW_LIMIT} ETB.`);
        return;
      }
      const profile = await db.get_user_profile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      const fee = amount * appSettings.WITHDRAWAL_FEE_PERCENT;
      const total_needed = amount + fee;
      if (total_needed > available) {
        await sendOrEdit(ctx, `${EMOJI_CROSS} Insufficient withdrawable balance (need ${Math.floor(total_needed)} with fee).`);
        return;
      }
      session.data.withdraw_amount = amount;
      session.data.withdraw_fee = fee;
      session.data.withdraw_method = "telebirr";
      session.state = STATE_WITHDRAW_CONFIRM;
      await sendOrEdit(ctx,
        `<b>Confirm withdrawal of ${Math.floor(amount)} ETB (fee ${Math.floor(fee)} ETB) to ${session.data.withdraw_account}</b>`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Confirm", callback_data: "withdraw_confirm", icon_custom_emoji_id: ID_CONFIRM, style: "success" },
                { text: "Cancel", callback_data: "withdraw_cancel", icon_custom_emoji_id: ID_CANCEL, style: "danger" }
              ]
            ]
          }
        }
      );
      return;
    }
  });

  // ---------- Webhook Setup ----------
  const app = express();
  app.use((req, res, next) => {
    logger.info(`📨 ${req.method} ${req.url} from ${req.ip}`);
    next();
  });

  // Webhook endpoint – Render/Express webhook mode
  // IMPORTANT: do not mount Telegraf's callback on /webhook. Express strips
  // the mounted path before passing the request to the callback, which can
  // make Telegraf reject the request with 404. Keep the original URL intact.
  app.get(WEBHOOK_PATH, (req, res) => {
    res.status(200).send('Webhook is ready (POST only)');
  });

  // Parse Telegram JSON only for the webhook request, then pass the original
  // /webhook path to Telegraf. This is compatible with Render's web service.
  app.use((req, res, next) => {
    if (req.path === WEBHOOK_PATH && req.method === 'POST') {
      return express.raw({ type: 'application/json' })(req, res, next);
    }
    next();
  });
  app.use(await bot.webhookCallback(WEBHOOK_PATH));

  app.get('/health', (req, res) => res.status(200).send('OK'));
  app.get('/', (req, res) => res.status(200).send('Bot is running'));

  // Catch-all for debugging
  app.use((req, res) => {
    logger.warn(`⚠️ Unhandled request: ${req.method} ${req.url}`);
    res.status(404).send('Not found');
  });

  // Delete old webhook and set new one
  try {
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(WEBHOOK_URL);
    logger.info(`✅ Webhook set to ${WEBHOOK_URL}`);
    const info = await bot.telegram.getWebhookInfo();
    logger.info(`📋 Webhook info: ${JSON.stringify(info, null, 2)}`);
    if (info.last_error_message) {
      logger.error(`⚠️ Webhook error: ${info.last_error_message}`);
    }
  } catch (err) {
    logger.error(`❌ Failed to set webhook: ${err.message}`);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ Webhook server listening on port ${PORT}`);
    logger.info(`📨 Webhook URL: ${WEBHOOK_URL}`);
  });

  // Graceful shutdown
  process.once('SIGINT', async () => {
    logger.info('Shutting down...');
    await bot.telegram.deleteWebhook();
    process.exit(0);
  });
  process.once('SIGTERM', async () => {
    logger.info('Shutting down...');
    await bot.telegram.deleteWebhook();
    process.exit(0);
  });
}

// ===================================================================
// START APPLICATION
// ===================================================================
if (require.main === module) {
  main().catch(err => {
    logger.error(`Fatal crash: ${err.message}`, err);
    process.exit(1);
  });
}