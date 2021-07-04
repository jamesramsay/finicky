import { finickyConfigSchema, FinickyConfig } from "../types";

export function validateConfig(config: FinickyConfig) {
  finickyConfigSchema.parse(config);
  return true;
}
