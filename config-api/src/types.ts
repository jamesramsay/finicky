import { z } from "zod";
import { parseUrl } from "./parseUrl";

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

export const browserObjectSchema = z.object({
  name: z.string(),
  openInBackground: z.boolean().optional(),
  appType: appType,
  profile: z.string().optional(),
  args: z.array(z.string()).optional(),
});

export const browserObjectConfigSchema = z.object({
  name: z.string(),
  openInBackground: z.boolean().optional(),
  appType: appType.optional(),
  profile: z.string().optional(),
  args: z.array(z.string()).optional(),
});

const browserValueSchema = z.union([
  z.string(),
  z.literal(null),
  browserObjectSchema,
]);

const browserFunction = z
  .function()
  .args(functionOptions)
  .returns(browserValueSchema);

const browserSchema = browserFunction.or(browserValueSchema);

const browserConfigValueSchema = z.union([
  browserSchema,
  z.array(browserSchema),
]);

export type BrowserValue = z.infer<typeof browserValueSchema>;
export type BrowserObject = z.infer<typeof browserObjectSchema>;
export type Browser = z.infer<typeof browserSchema>;
export type BrowserConfigValue = z.infer<typeof browserConfigValueSchema>;

/******************
 * Options
 * Miscellaneous options to set
 ******************/

const hostnames = z.array(z.string());

export const globalOptionsSchema = z.object({
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

const matcherFunction = z.function().args(functionOptions).returns(z.boolean());

const matcher = z.union([z.string(), z.instanceof(RegExp), matcherFunction]);

export type Matcher = z.infer<typeof matcher>;

const hostnameMatcherFunction = z
  .function()
  .args(z.string(), functionOptions)
  .returns(z.boolean());

const hostnameMatcher = z.union([
  z.string(),
  z.instanceof(RegExp),
  hostnameMatcherFunction,
]);

export type HostnameMatcher = z.infer<typeof hostnameMatcher>;

/******************
 * Rewriting
 ******************/

const urlResultSchema = z.union([urlResult, urlFunction]);

const rewriter = z.object({
  match: z.union([matcher, z.array(matcher)]).optional(),
  matchHostname: z
    .union([hostnameMatcher, z.array(hostnameMatcher)])
    .optional(),
  url: urlResultSchema,
});

export type Rewriter = z.infer<typeof rewriter>;

/******************
 * Handling
 ******************/

const handler = rewriter.extend({
  browser: z.union([browserSchema, z.array(browserSchema)]),
  match: z.union([matcher, z.array(matcher)]).optional(),
  matchHostname: z
    .union([hostnameMatcher, z.array(hostnameMatcher)])
    .optional(),
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

export const finickyConfigSchema = z
  .object({
    defaultBrowser: browserConfigValueSchema.default("Safari"),
    options: globalOptionsSchema.partial().optional(),
    rewrite: z.array(rewriter).optional(),
    handlers: z.array(handler).optional(),
  })
  .strict();

console.log(finickyConfigSchema.parse({}));

export type FinickyConfig = z.infer<typeof finickyConfigSchema>;
