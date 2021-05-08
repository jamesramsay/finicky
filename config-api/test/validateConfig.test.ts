import { validateConfig } from "../src/validateConfig";

describe("basic test", () => {
  test("invalid config", () => {
    const config = "!! invalid config !!";
    expect(() => validateConfig(config as any)).toThrow();
  });

  test("valid minimal config", () => {
    const config = {
      defaultBrowser: "Browser",
    };

    expect(validateConfig(config)).toBe(true);
  });

  test("invalid minimal config", () => {
    const config = {
      defaultBrowser: "Browser",
      invalidKey: "This key is invalid",
    };

    expect(() => validateConfig(config)).toThrow();
  });
});

describe("default browser", () => {
  test("browser string", () => {
    const config = {
      defaultBrowser: "Browser",
    };

    expect(validateConfig(config)).toBe(true);
  });

  test("browser function", () => {
    const config = {
      defaultBrowser: () => "Browser",
    };

    expect(validateConfig(config)).toBe(true);
  });

  test("browser object", () => {
    const config = {
      defaultBrowser: {
        name: "Browser",
      },
    };

    expect(validateConfig(config)).toBe(true);
  });

  test("browser object", () => {
    const config = {
      defaultBrowser: () => ({
        name: "Browser",
      }),
    };

    expect(validateConfig(config)).toBe(true);
  });
});
