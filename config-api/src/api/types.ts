/**
 * Finicky API Types
 */

import { parseUrl } from "../parseUrl";

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
  parseUrl: typeof parseUrl;
}

export interface InternalAPI {
  log: LogFunction;
  notify: NotifyFunction;
  getBattery: BatteryFunction;
  getSystemInfo: SystemInfoFunction;
  getKeys(): KeyOptions;
}

/**
 * An object that represents a key options object
 */
type KeyOptions = {
  shift: boolean;
  option: boolean;
  command: boolean;
  control: boolean;
  capsLock: boolean;
  function: boolean;
};
