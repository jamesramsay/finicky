import urlParse from "url-parse";
import path from "path";
import chalk from "chalk";

import { processUrl } from "./processUrl";
import { validateConfig } from "./validateConfig";
import { decorateAPI } from "./decorateAPI";

const [, , ...args] = process.argv;

const finicky = decorateAPI({
  log(message) {
    console.log(chalk`{dim [log]} ${message}`);
  },
  notify(title, subtitle) {
    console.log(chalk`{dim [notification]} {bold ${title}} ${subtitle}`);
  },
  getBattery: () => ({
    chargePercentage: 50,
    isCharging: true,
    isPluggedIn: true,
  }),
  getSystemInfo: () => ({
    name: "name",
    localizedName: "localized name",
    address: "127.0.0.1",
  }),
  getKeys: () => ({
    shift: false,
    option: false,
    command: false,
    control: false,
    capsLock: false,
    function: false,
  }),
});

function errorMessage(message: string, exception: Error | string) {
  console.log(
    chalk`{red.bold Error:} ${message} {red ${exception.toString()}}`
  );
}

// @ts-ignore
global.finicky = finicky;

const configPath = path.resolve(
  process.cwd(),
  args[1] || "./.finicky.example.js"
);

const url = args[0] || "https://example.com/test";

const protocol = urlParse(url).protocol.replace(":", "");

console.log(chalk`Opening configuration file {dim ${configPath}}`);

let config;

try {
  config = require(configPath);
} catch (ex) {
  errorMessage("Couldn't open configuration file. ", ex);
  process.exit(1);
}

try {
  validateConfig(config);
} catch (ex) {
  errorMessage("Couldn't validate configuration. ", ex);
  process.exit(1);
}

try {
  const options = {
    opener: {
      pid: 1337,
      path: "/dev/null",
      name: "Finicky",
      bundleId: "net.kassett.Finicky",
    },
  };

  const result = processUrl(config, url, options);
  console.log(chalk`Result:
{green ${JSON.stringify(result, null, 2)}}`);
} catch (ex) {
  errorMessage("Couldn't validate result. ", ex);
  process.exit(1);
}
