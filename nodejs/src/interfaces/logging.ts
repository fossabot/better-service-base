import {BSBError} from "../base";
import {ParamsFromString} from "./tools";

/**
 * The debug mode of the app
 * @example "production" - production mode with no debug
 * @example "production-debug" - production mode with debug
 * @example "development" - development mode with debug
 */
export type DEBUG_MODE = "production" | "production-debug" | "development";

export type SafeLogData =
    | string
    | number
    | boolean
    | Array<string | number | boolean>
    | Object;
export type UnsafeLogData = {
  value: string | number | boolean | Array<string | number | boolean> | Object; // Unsafe and unsanitized data
  safeValue: SafeLogData; // Safe and sanitized data
}; // Data can contain sensitive information

export type LogMeta<T extends string> = Record<
    ParamsFromString<T>,
    UnsafeLogData | SafeLogData
>;

/**
 * If you are going to make an object or something, use LogMeta instead.
 */
export type SmartLogMeta<T extends string> = ParamsFromString<T> extends never
                                             ? [undefined?]
                                             : [meta: Record<ParamsFromString<T>, UnsafeLogData | SafeLogData>];

export interface IPluginLogger {
  info<T extends string>(message: T, ...meta: SmartLogMeta<T>): void;

  warn<T extends string>(message: T, ...meta: SmartLogMeta<T>): void;

  debug<T extends string>(message: T, ...meta: SmartLogMeta<T>): void;

  error<T extends string>(
      message: T,
      ...meta: SmartLogMeta<T>
  ): void;

  error<T extends string>(error: BSBError<T>): void;
}

/**
 * @hidden
 */
export const LoggingEventTypesBase = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
} as const;
/**
 * @hidden
 */
export type LoggingEventTypes =
    (typeof LoggingEventTypesBase)[keyof typeof LoggingEventTypesBase];