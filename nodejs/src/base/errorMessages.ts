import {LogMeta, ParamsFromString} from "../interfaces";
import {LogFormatter} from "./logFormatter";

/**
 * @hidden
 */
export type ErrorLogMetaDefinition<T extends string> = {
  message: T;
  meta: LogMeta<T>;
};
export type ErrorLogMeta<T extends string> = ParamsFromString<T> extends never
                                             ? [undefined?]
                                             : [meta: LogMeta<T>];

/**
 * BSBError is a custom error class that allows for better error handling and logging
 *
 * @group Errors
 * @category Tools
 * @param message - The message to log
 * @param meta - Additional information to log with the message
 * @constructor
 */
export class BSBError<T extends string>
    extends Error {
  constructor(
      message: T,
      ...meta: ErrorLogMeta<T>
  ) {
    const formatter = new LogFormatter();
    super(formatter.formatLog(message, ...meta));
    this.name = "BSBError-" + message;
    this.raw = {
      message: message,
      meta: meta,
    };
  }

  public raw: ErrorLogMetaDefinition<string> | null = null;

  public toString(): string {
    return this.message;
  }
}

/**
 * @hidden
 */
export function BSB_ERROR_METHOD_NOT_IMPLEMENTED(
    className: string,
    method: string,
) {
  return new BSBError(
      "Method not implemented: {class}.{method}",
      {
        class: className,
        method: method,
      },
  );
}
