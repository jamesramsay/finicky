import { parseUrl, matchHostnames } from "./decorateAPI";
import { z } from "zod";

/**
 * Finicky API Types
 */

type LogFunction = (...messages: string[]) => void;
type NotifyFunction = (title: string, subtitle: string) => void;
type BatteryFunction = () => {
  chargePercentage: number;
  isCharging: boolean;
  isPluggedIn: boolean;
};

type SystemInfoFunction = () => {
  name: string;
  localizedName: string;
  address: string;
};

// Finicky Config API
export interface ConfigAPI extends InternalAPI {
  getUrlParts: typeof parseUrl;
  parseUrl: typeof parseUrl;
  matchHostnames: typeof matchHostnames;
  matchDomains: typeof matchHostnames;
}

export interface InternalAPI {
  log: LogFunction;
  notify: NotifyFunction;
  getBattery: BatteryFunction;
  getSystemInfo: SystemInfoFunction;
  getKeys(): KeyOptions;
}

/**
 * Finicky Configuration Schemas and Types
 */

/******************
 * Function options
 ******************/

const urlObjectSchema = z.object({
  protocol: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  host: z.string(),
  port: z.union([z.number(), z.literal(null)]).optional(),
  pathname: z.string().optional(),
  search: z.string().optional(),
  hash: z.string().optional(),
});

const application = z.object({
  pid: z.number(),
  path: z.string().optional(),
  bundleId: z.string().optional(),
  name: z.string().optional(),
});

export type Application = z.infer<typeof application>;

const functionOptions = z.object({
  urlString: z.string(),
  url: urlObjectSchema,
  opener: application,
});

export type FunctionOptions = z.infer<typeof functionOptions>;

/******************
 * URL
 * A string, a partial object or a funtion returning either
 ******************/

const urlPartialSchema = z.union([z.string(), urlObjectSchema.partial()]);

export const urlSchema = z.union([z.string(), urlObjectSchema]);
const urlResult = z.union([z.string(), urlPartialSchema]);

const urlFunction = z.function().args(functionOptions).returns(urlResult);

export type URL = z.infer<typeof urlSchema>;
export type URLFunction = z.infer<typeof urlFunction>;
export type UrlObject = z.infer<typeof urlObjectSchema>;
export type PartialURL = z.infer<typeof urlPartialSchema>;

/******************
 * Browser
 * A string, an object or a funtion returning either
 ******************/

const appType = z.union([
  z.literal("appName"),
  z.literal("appPath"),
  z.literal("bundleId"),
  z.literal("none"),
]);

export type AppType = z.infer<typeof appType>;

export const browserObject = z.object({
  name: z.string(),
  openInBackground: z.boolean().optional(),
  appType: appType.optional(),
  profile: z.string().optional(),
  args: z.array(z.string()).optional(),
});

const browserValue = z.union([z.string(), z.literal(null), browserObject]);

const browserFunction = z
  .function()
  .args(functionOptions)
  .returns(browserValue);

const matcherFunction = z.function().args(functionOptions).returns(z.boolean());

const browserSchema = browserFunction.or(browserValue);

const browserResult = z.union([browserSchema, z.array(browserSchema)]);

export type BrowserValue = z.infer<typeof browserValue>;
export type BrowserObject = z.infer<typeof browserObject>;
export type Browser = z.infer<typeof browserSchema>;
export type BrowserResult = z.infer<typeof browserResult>;

/******************
 * Options
 * Miscellaneous options to set
 ******************/

const hostnames = z.array(z.string());

const options = z.object({
  hideIcon: z.boolean().default(false),
  checkForUpdate: z.boolean().default(true),
  logRequests: z.boolean().default(false),
  urlShorteners: z.union([
    hostnames,
    z.function().args(hostnames).returns(hostnames),
  ]),
});

/******************
 * Matching
 ******************/

const matcher = z.union([z.string(), z.instanceof(RegExp), matcherFunction]);

export type Matcher = z.infer<typeof matcher>;

/******************
 * Rewriting
 ******************/

const urlResultSchema = z.union([urlResult, urlFunction]);

const rewriter = z.object({
  match: z.union([matcher, z.array(matcher)]),
  url: urlResultSchema,
});

export type Rewriter = z.infer<typeof rewriter>;

/******************
 * Handling
 ******************/

const handler = rewriter.extend({
  browser: z.union([browserSchema, z.array(browserSchema)]),
  match: z.union([matcher, z.array(matcher)]),
  url: urlResultSchema.optional(),
});

export type Handler = z.infer<typeof handler>;

export type ProcessUrlResult = {
  browsers: BrowserObject[];
  url: string;
};

/******************
 * Full config
 ******************/

export const configSchema = z
  .object({
    defaultBrowser: browserResult.default("Safari"),
    options: options.partial().optional(),
    rewrite: z.array(rewriter).optional(),
    handlers: z.array(handler).optional(),
  })
  .strict();

export type FinickyConfig = z.infer<typeof configSchema>;

/**
 * An object that represents a key options object
 */
const keyOptions = z.object({
  shift: z.boolean().default(false),
  option: z.boolean().default(false),
  command: z.boolean().default(false),
  control: z.boolean().default(false),
  capsLock: z.boolean().default(false),
  function: z.boolean().default(false),
});

type KeyOptions = z.infer<typeof keyOptions>;
