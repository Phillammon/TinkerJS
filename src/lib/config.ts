import { EnvType, load } from "ts-dotenv";

export const schema = {
  // Generic
  DEBUG: {
    type: Boolean,
    default: false,
  },

  STATE_FILE: {
    type: String,
    default: "tinker_crafts.json",
  },

  // Credentials
  KOL_USER: String,
  KOL_PASS: String,

  // For 17-Ball reporting
  OPERATOR_ID: {
    type: Number,
    optional: true,
  },

  // Tinkering values
  CRAFTS_PER_CHALK: {
    type: Number,
    default: 10,
  },
  DAILY_FREE_CRAFTS: {
    type: Number,
    default: 100,
  },
  CRAFT_TEA_TO_MAINTAIN: {
    type: Number,
    default: 1000000,
  },
  MAX_CRAFTS_PER_KMAIL: {
    type: Number,
    default: 100000,
  },

  // Time data (in seconds)
  TRADE_BEACON_DELAY: {
    type: Number,
    default: 3600,
  },
  LOOP_DELAY: {
    type: Number,
    default: 60,
  },
};

export type Env = EnvType<typeof schema>;

export const config = load(schema);
