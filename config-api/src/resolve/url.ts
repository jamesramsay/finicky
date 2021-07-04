import { parseUrl } from "../parseUrl";
import {
  urlSchema,
  FunctionOptions,
  URLFunction,
  UrlObject,
  PartialURL,
} from "../types";

export function rewriteUrl(
  url: PartialURL | URLFunction,
  options: FunctionOptions
) {
  let urlResult = resolveUrl(url, options);

  urlSchema.parse(urlResult);

  if (typeof urlResult === "string") {
    return {
      ...options,
      url: parseUrl(urlResult),
      urlString: urlResult,
    };
  }

  return {
    ...options,
    url: urlResult,
    urlString: composeUrl(urlResult),
  };
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

/**
 * Compose a url from a Url Object
 */
export function composeUrl(url: UrlObject) {
  const { protocol, host, pathname = "" } = url;
  let port = url.port ? `:${url.port}` : "";
  let search = url.search ? `?${url.search}` : "";
  let hash = url.hash ? `#${url.hash}` : "";
  let auth = url.username ? `${url.username}` : "";
  auth += url.password ? `:${url.password}` : "";

  return `${protocol}://${auth}${host}${port}${pathname}${search}${hash}`;
}
