import urlParse from "url-parse";
import { UrlObject } from "./types";

/**
 * Helper function to parse urls
 */
export function parseUrl(urlString: string) {
  const url = urlParse(urlString);

  // Mistake in the urlParse typings. query should be a string unless parsing of query is enabled
  const search = (url.query as unknown) as string;

  return {
    username: url.username,
    host: url.hostname,
    protocol: url.protocol.replace(":", ""),
    pathname: url.pathname,
    search: search.replace("?", ""),
    password: url.password,
    port: url.port ? +url.port : undefined,
    hash: url.hash.replace("#", ""),
  } as UrlObject;
}
