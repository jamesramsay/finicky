import { AppType } from "../types";
import {
  browserObjectSchema,
  FunctionOptions,
  BrowserConfigValue,
  BrowserObject,
  BrowserValue,
  ProcessUrlResult,
} from "../types";

export function resolveBrowser(
  browser: BrowserConfigValue,
  options: FunctionOptions
): ProcessUrlResult {
  if (typeof browser === "function") {
    browser = browser(options);
  }

  browser = Array.isArray(browser) ? browser : [browser];

  return {
    browsers: browser.map(createBrowserObject),
    url: options.urlString,
  };
}

function createBrowserObject(browser: BrowserValue): BrowserObject {
  let result: BrowserObject;

  if (typeof browser == "string") {
    browser = { name: browser };
  }

  if (browser === null) {
    browser = {
      name: "",
      appType: "none",
    };
  }

  result = {
    ...browser,
  };

  browserObjectSchema.parse(result);

  return result;
}

export function guessAppType(value: string): AppType {
  if (looksLikeBundleIdentifier(value)) {
    return "bundleId";
  }

  if (looksLikeAbsolutePath(value)) {
    return "appPath";
  }

  return "appName";
}

function looksLikeBundleIdentifier(value: string) {
  // Regular expression to match Uniform Type Identifiers, "Bundle Identifiers"
  // Adapted from https://stackoverflow.com/a/34241710/1698327
  const bundleIdRegex = /^[A-Za-z]{2,6}((?!-)\.[A-Za-z0-9-]{1,63})+$/;
  return bundleIdRegex.test(value);
}

function looksLikeAbsolutePath(value: string) {
  return value.startsWith("/") || value.startsWith("~");
}
