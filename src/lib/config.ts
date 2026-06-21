import { EnvType, load } from "ts-dotenv";

export const schema = {
  // Generic
  DEBUG: {
    type: Boolean,
    default: false,
  },

  BANKED_CRAFT_FILE: {
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
};

export type Env = EnvType<typeof schema>;

export const config = load(schema);
