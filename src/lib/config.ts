import { EnvType, load } from "ts-dotenv";

export const schema = {
  // Generic
  DEBUG: {
    type: Boolean,
    default: false,
  },

  // Credentials
  KOL_USER: String,
  KOL_PASS: String,
};

export type Env = EnvType<typeof schema>;

export const config = load(schema);
