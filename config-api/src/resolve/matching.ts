import { FunctionOptions, Matcher, HostnameMatcher } from "../types";

export function isMatch(
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
      return !!matcher(options);
    }

    return false;
  });
}

export function isHostnameMatch(
  matcher: HostnameMatcher | HostnameMatcher[] | undefined,
  options: FunctionOptions
) {
  if (!matcher) {
    return false;
  }

  const { host: hostname } = options.url;

  const matchers = Array.isArray(matcher) ? matcher : [matcher];

  return matchers.some((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(hostname);
    } else if (typeof matcher === "string") {
      const regex = createRegularExpression(matcher);
      return regex.test(hostname);
    } else if (typeof matcher === "function") {
      return !!matcher(hostname, options);
    }

    return false;
  });
}

export function createRegularExpression(pattern: string) {
  if (!pattern) {
    return /^$/;
  }

  let result = pattern;

  result = result.replace(/[-[\]\/{}()*+?.,\\^$|#\s]/g, "\\$&");
  result = result.replace(/\\\*/g, ".*");

  if (!pattern.startsWith("http://") && !pattern.startsWith("https://")) {
    result = "https?:\\/\\/" + result;
  }

  return new RegExp("^" + result + "$", "i");
}
