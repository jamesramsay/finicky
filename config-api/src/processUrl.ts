import {
  urlSchema,
  browserObject,
  FinickyConfig,
  Application,
  ConfigAPI,
  FunctionOptions,
  Browser,
  URLFunction,
  UrlObject,
  Matcher,
  PartialURL,
  BrowserResult,
  BrowserObject,
  BrowserValue,
  ProcessUrlResult,
} from "./types";

import {
  createRegularExpression,
  guessAppType,
  composeUrl,
  deprecate,
} from "./utils";

// Assume the module.exports is available
declare const module: {
  exports?: FinickyConfig;
};

// The finicky api is available here
declare const finicky: ConfigAPI;

export function processUrl(
  config: FinickyConfig,
  url: string,
  opener: Application
): ProcessUrlResult {
  let options: FunctionOptions = {
    urlString: url,
    url: finicky.parseUrl(url),
    opener,
  };

  if (config?.options?.logRequests) {
    if (opener) {
      finicky.log(
        `Opening ${url} from ${opener.name || "N/A"}\n\tbundleId: ${
          opener.bundleId || "N/A"
        }\n\tpath: ${opener.path || "N/A"}`
      );
    } else {
      finicky.log(`Opening ${url} from an unknown application`);
    }
  }

  if (!config) {
    // If there's no config available use Safari as the browser
    return resolveBrowser("Safari", options);
  }

  // Rewrite the url
  options = processUrlRewrites(config, options);

  return processHandlers(config, options);
}

function processUrlRewrites(config: FinickyConfig, options: FunctionOptions) {
  if (Array.isArray(config.rewrite)) {
    for (let rewrite of config.rewrite) {
      if (isMatch(rewrite.match, options)) {
        options = rewriteUrl(rewrite.url, options);
      }
    }
  }

  return options;
}

function processHandlers(
  config: FinickyConfig,
  options: FunctionOptions
): ProcessUrlResult {
  if (Array.isArray(config.handlers)) {
    for (let handler of config.handlers) {
      if (isMatch(handler.match, options)) {
        if (handler.url) {
          options = rewriteUrl(handler.url, options);
        }

        const browser = handler.browser;

        if (Array.isArray(browser)) {
          return resolveBrowser(browser, options);
        } else {
          return resolveBrowser(browser, options);
        }
      }
    }
  }

  return resolveBrowser(config.defaultBrowser, options);
}

function rewriteUrl(url: PartialURL | URLFunction, options: FunctionOptions) {
  let urlResult = resolveUrl(url, options);

  urlSchema.parse(urlResult);

  if (typeof urlResult === "string") {
    return {
      ...options,
      url: finicky.parseUrl(urlResult),
      urlString: urlResult,
    };
  }

  return {
    ...options,
    url: urlResult,
    urlString: composeUrl(urlResult),
  };
}

function isMatch(
  matcher: Matcher | Matcher[] | undefined,
  options: FunctionOptions
) {
  if (!matcher) {
    return false;
  }

  const matchers = Array.isArray(matcher) ? matcher : [matcher];

  return matchers.some((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(options.urlString);
    } else if (typeof matcher === "string") {
      const regex = createRegularExpression(matcher);
      return regex.test(options.urlString);
    } else if (typeof matcher === "function") {
      // Add a deprecation warning when accessing certain deprecated properties
      const deprecatedOptions = deprecate(
        options,
        new Map([
          [
            "keys",
            "Use finicky.getKeys() instead, see https://github.com/johnste/finicky/wiki/Configuration#parameters",
          ],
          [
            "sourceBundleIdentifier",
            "Use opener.bundleId instead, see https://github.com/johnste/finicky/wiki/Configuration#parameters",
          ],
          [
            "sourceProcessPath",
            "Use opener.path instead, see https://github.com/johnste/finicky/wiki/Configuration#parameters",
          ],
        ])
      );

      return !!matcher(deprecatedOptions);
    }

    return false;
  });
}

// Recursively resolve handler to value
function resolveUrl(
  result: PartialURL | URLFunction,
  options: FunctionOptions
): UrlObject | string {
  if (typeof result === "string") {
    return result;
  } else if (typeof result === "object") {
    return { ...options.url, ...result };
  }

  const resolved = result(options);
  if (typeof resolved === "string") {
    return resolved;
  }

  return { ...options.url, ...resolved };
}

function resolveBrowser(
  browser: BrowserResult,
  options: FunctionOptions
): ProcessUrlResult {
  if (typeof browser === "function") {
    browser = browser(options);
  }

  if (!Array.isArray(browser)) {
    browser = [browser];
  }

  const browsers = browser.map(createBrowser);

  return { browsers, url: options.urlString };
}

function createBrowser(browser: BrowserValue): BrowserObject {
  let result: BrowserObject;

  if (
    browser === null ||
    (typeof browser === "object" && browser.appType === "none")
  ) {
    result = {
      name: "",
      appType: "none",
    };
  } else {
    if (typeof browser === "string") {
      browser = { name: browser };
    }

    const name = browser.name === null ? "" : browser.name;

    result = {
      ...browser,
      name,
      appType: guessAppType(browser.name),
    };
  }

  browserObject.parse(result);

  return result;
}
