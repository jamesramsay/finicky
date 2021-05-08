import { configSchema, FinickyConfig } from "./types";

export function validateConfig(config: FinickyConfig) {
  configSchema.parse(config);
  return true;
}
