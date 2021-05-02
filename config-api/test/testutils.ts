import { processUrl } from "../src/processUrl";
import { FinickyConfig, Handler, Rewriter } from "../src/types";
import { Matcher, UrlObject, Url, UrlFunction } from "../src/types";

export function id<T>(value: T) {
  return () => value;
}

export function curryProcessUrl(url: string) {
  const processOptions = {
    opener: {
      pid: 1337,
      path: "/dev/null",
      name: "Finicky",
      bundleId: "net.kassett.Finicky",
    },
  };

  return (config: FinickyConfig, otherUrl?: string) =>
    processUrl(config, otherUrl || url, processOptions);
}

export function createRewriteRule({
  url = "https://test.changed",
  match = () => true,
}: {
  url?: Partial<UrlObject> | Url | UrlFunction;
  match?: Matcher;
} = {}) {
  return {
    defaultBrowser: "test",
    rewrite: [{ match, url: url }],
  };
}

export function getKeys() {
  return {
    shift: false,
    option: false,
    command: false,
    control: false,
    capsLock: false,
    function: false,
  };
}

const EXAMPLE_BROWSER = "Default Browser";

export function createHandlerConfig(handlers: Handler | Handler[]) {
  return {
    defaultBrowser: EXAMPLE_BROWSER,
    handlers: Array.isArray(handlers) ? handlers : [handlers],
  };
}

export function createRewriteConfig(rewrite: Rewriter[]) {
  return {
    defaultBrowser: EXAMPLE_BROWSER,
    rewrite: Array.isArray(rewrite) ? rewrite : [rewrite],
  };
}
