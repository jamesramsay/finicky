import { parseUrl } from "../parseUrl";
import { ConfigAPI, InternalAPI } from "./types";

/**
 * Extends finicky js api with some utility functions.
 */
export function decorateAPI(finickyInternalAPI: InternalAPI): ConfigAPI {
  return {
    ...finickyInternalAPI,
    log: (message: string | string[]) => {
      const messages = Array.isArray(message) ? message : [message];
      finickyInternalAPI.log(messages.join(" "));
    },
    parseUrl,
  };
}
