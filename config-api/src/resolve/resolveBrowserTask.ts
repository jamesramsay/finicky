import { isHostnameMatch, isMatch } from "./matching";
import { resolveBrowser } from "./browser";
import {
  FinickyConfig,
  Application,
  ConfigAPI,
  FunctionOptions,
  ProcessUrlResult,
  finickyConfigSchema,
  globalOptionsSchema,
  Handler,
} from "../types";

import { rewriteUrl } from "./url";
import { parseUrl } from "../parseUrl";

// Assume the module.exports is available
declare const module: {
  exports?: FinickyConfig;
};

// The finicky api is available here
export declare const finicky: ConfigAPI;

export function resolveBrowserTask(
  config: FinickyConfig,
  url: string,
  opener: Application
): ProcessUrlResult {
  let completeConfig: FinickyConfig = finickyConfigSchema.parse(config);

  let functionOptions: FunctionOptions = {
    urlString: url,
    url: parseUrl(url),
    opener,
  };

  let globalOptions = globalOptionsSchema.parse(completeConfig.options);

  if (globalOptions.logRequests) {
    logRequests(opener, url);
  }

  if (!config || !Array.isArray(config.handlers)) {
    // If there's no config available use Safari as the browser
    return resolveBrowser("Safari", functionOptions);
  }

  // Rewrite the url
  functionOptions = processUrlRewrites(config, functionOptions);

  const task = processHandlers(config.handlers, functionOptions);

  return task ?? resolveBrowser(config.defaultBrowser, functionOptions);
}

function logRequests(opener: Application, url: string) {
  finicky.log(
    `Opening ${url} from ${opener.name || "N/A"}\n\tbundleId: ${
      opener.bundleId || "N/A"
    }\n\tpath: ${opener.path || "N/A"}`
  );
}

function processHandlers(
  handlers: Handler[],
  options: FunctionOptions
): ProcessUrlResult | undefined {
  for (let handler of handlers) {
    if (
      isHostnameMatch(handler.matchHostname, options) ||
      isMatch(handler.match, options)
    ) {
      if (handler.url) {
        options = rewriteUrl(handler.url, options);
      }

      return resolveBrowser(handler.browser, options);
    }
  }

  return undefined;
}

export function processUrlRewrites(
  config: FinickyConfig,
  options: FunctionOptions
) {
  if (!Array.isArray(config.rewrite)) {
    return options;
  }

  config.rewrite.forEach((rewrite) => {
    if (
      isHostnameMatch(rewrite.matchHostname, options) ||
      isMatch(rewrite.match, options)
    ) {
      options = rewriteUrl(rewrite.url, options);
    }
  });

  return options;
}
