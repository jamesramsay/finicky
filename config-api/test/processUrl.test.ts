import { ConfigAPI } from "../src/types";
import {
  curryProcessUrl,
  id,
  createRewriteRule,
  createHandlerConfig,
  api,
} from "./testutils";

const cpurl = curryProcessUrl("https://test.example");
declare global {
  namespace NodeJS {
    interface Global {
      finicky: ConfigAPI;
    }
  }
}

describe("Rewrites", () => {
  describe("Rewrite matcher", () => {
    beforeAll(() => {
      global.finicky = api;
    });

    test("function that returns true", () => {
      const config = createRewriteRule({ match: id(true) });
      expect(cpurl(config).url).toBe("https://test.changed");
    });

    test("function that returns false", () => {
      const config = createRewriteRule({ match: id(false) });
      expect(cpurl(config).url).not.toBe("https://test.changed");
    });

    test("match regular expression", () => {
      const config = createRewriteRule({ match: /test\.example/ });
      expect(cpurl(config).url).toBe("https://test.changed");
    });

    test("match string", () => {
      const config = createRewriteRule({ match: "https://test.example" });
      expect(cpurl(config).url).toBe("https://test.changed");
    });

    test("match wildcard pattern", () => {
      const config = createRewriteRule({ match: "https://test.example/*" });
      const result = cpurl(
        config,
        "https://test.example/path?query=123#anchor"
      );
      expect(result.url).toBe("https://test.changed");
    });
  });

  describe("Rewrite url", () => {
    beforeAll(() => {
      global.finicky = api;
    });

    test("String", () => {
      const config = createRewriteRule({ url: "https://test.changed" });
      expect(cpurl(config).url).toBe("https://test.changed");
    });

    test("Function", () => {
      const config = createRewriteRule({
        url: () => "https://test.changed",
      });
      expect(cpurl(config).url).toBe("https://test.changed");
    });

    test("Function arguments", () => {
      const config = createRewriteRule({
        url: ({ urlString }) => urlString + "?ok",
      });
      expect(cpurl(config).url).toBe("https://test.example?ok");
    });

    test("Function argument object", () => {
      const config = createRewriteRule({
        url: ({ urlString, url }) => urlString + "?" + url.protocol,
      });
      expect(cpurl(config).url).toBe("https://test.example?https");
    });

    test("Object result ", () => {
      const config = createRewriteRule({
        url: id({
          host: "test2.example",
        }),
      });
      expect(cpurl(config).url).toBe("https://test2.example");
    });
  });

  describe("Rewrite partial url", () => {
    beforeAll(() => {
      global.finicky = api;
    });

    test("Protocol change", () => {
      const config = createRewriteRule({ url: { protocol: "ftp" } });
      const result = cpurl(config, "http://example.com");
      expect(result.url).toBe("ftp://example.com");
    });

    test("Hostname change", () => {
      const config = createRewriteRule({
        url: { host: "example.org" },
      });
      const result = cpurl(config, "http://example.com");
      expect(result.url).toBe("http://example.org");
    });

    test("Multiple change", () => {
      const config = createRewriteRule({
        url: { hash: "anchor", port: 1234, pathname: "/a/path" },
      });
      const result = cpurl(config, "http://example.com");
      expect(result.url).toBe("http://example.com:1234/a/path#anchor");
    });
  });
});

const CHANGED_BROWSER = "Custom Browser";
const EXAMPLE_BUNDLEID = "bundle.id";

describe("Handlers", () => {
  describe("Matcher", () => {
    beforeAll(() => {
      global.finicky = api;
    });

    test("function that returns true", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        match: id(true),
      });
      expect(cpurl(config).browsers[0].name).toBe(CHANGED_BROWSER);
    });

    test("function that returns false", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        match: id(false),
      });
      expect(cpurl(config).browsers[0].name).not.toBe(CHANGED_BROWSER);
    });

    test("match regular expression", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        match: /test\.example/,
      });
      expect(cpurl(config).browsers[0].name).toBe(CHANGED_BROWSER);
    });

    test("match string", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        match: "https://test.example",
      });
      expect(cpurl(config).browsers[0].name).toBe(CHANGED_BROWSER);
    });

    test("match wildcard pattern", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        match: "https://test.example/*",
      });
      const result = cpurl(
        config,
        "https://test.example/path?query=123#anchor"
      );
      expect(result.browsers[0].name).toBe(CHANGED_BROWSER);
    });
  });

  describe("Browser", () => {
    describe("Browser name", () => {
      test("string", () => {
        const config = createHandlerConfig({
          browser: CHANGED_BROWSER,
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: CHANGED_BROWSER,
          appType: "appName",
        });
      });

      test("string function", () => {
        const config = createHandlerConfig({
          browser: id(CHANGED_BROWSER),
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: CHANGED_BROWSER,
          appType: "appName",
        });
      });

      test("object", () => {
        const config = createHandlerConfig({
          browser: { name: CHANGED_BROWSER },
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: CHANGED_BROWSER,
          appType: "appName",
        });
      });

      test("object function", () => {
        const config = createHandlerConfig({
          browser: id({ name: CHANGED_BROWSER }),
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: CHANGED_BROWSER,
          appType: "appName",
        });
      });
    });

    describe("Bundle id", () => {
      test("string", () => {
        const config = createHandlerConfig({
          browser: EXAMPLE_BUNDLEID,
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: EXAMPLE_BUNDLEID,
          appType: "bundleId",
        });
      });

      test("string function", () => {
        const config = createHandlerConfig({
          browser: id(EXAMPLE_BUNDLEID),
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: EXAMPLE_BUNDLEID,
          appType: "bundleId",
        });
      });

      test("object", () => {
        const config = createHandlerConfig({
          browser: { name: EXAMPLE_BUNDLEID },
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: EXAMPLE_BUNDLEID,
          appType: "bundleId",
        });
      });

      test("object function", () => {
        const config = createHandlerConfig({
          browser: id({ name: EXAMPLE_BUNDLEID }),
          match: id(true),
        });
        expect(cpurl(config).browsers[0]).toEqual({
          name: EXAMPLE_BUNDLEID,
          appType: "bundleId",
        });
      });
    });
  });

  describe("Handlers with browser and url rewrite", () => {
    test("that matches and rewrites the url", () => {
      const config = createHandlerConfig({
        browser: CHANGED_BROWSER,
        url: "https://test.changed",
        match: id(true),
      });
      const result = cpurl(config);
      expect(result.browsers[0].name).toBe(CHANGED_BROWSER);
      expect(result.url).toBe("https://test.changed");
    });
  });
});
