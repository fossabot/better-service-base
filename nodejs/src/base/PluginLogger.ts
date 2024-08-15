import {DEBUG_MODE, IPluginLogger, SmartLogMeta} from "../interfaces";
import {SBLogging} from "../serviceBase";
import {BSBError} from "./errorMessages";

export class PluginLogger
    implements IPluginLogger {
  private logging: SBLogging;
  private pluginName: string;
  private canDebug = false;

  constructor(mode: DEBUG_MODE, plugin: string, logging: SBLogging) {
    this.logging = logging;
    this.pluginName = plugin;
    if (mode !== "production") {
      this.canDebug = true;
    }
  }

  /**
   * Logs a debug message
   *
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @example
   * ```ts
   * this.log.debug("This is a debug log");
   * this.log.debug("This is a debug {key}", {"key": "log"});
   * ```
   */
  public debug<T extends string>(message: T, ...meta: SmartLogMeta<T>): void {
    if (this.canDebug) {
      this.logging.logBus.emit("debug", this.pluginName, message, ...meta);
    }
  }

  /**
   * Logs an info message
   *
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @example
   * ```ts
   * this.log.info("This is an info log");
   * this.log.info("This is an info {key}", {"key": "log"});
   * ```
   */
  public info<T extends string>(message: T, ...meta: SmartLogMeta<T>): void {
    this.logging.logBus.emit("info", this.pluginName, message, ...meta);
  }

  /**
   * Logs a warn message
   *
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @example
   * ```ts
   * this.log.warn("This is a warn log");
   * this.log.warn("This is a warn {key}", {"key": "log"});
   * ```
   */
  public warn<T extends string>(message: T, ...meta: SmartLogMeta<T>): void {
    this.logging.logBus.emit("warn", this.pluginName, message, ...meta);
  }

  /**
   * Logs an error message
   *
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @example
   * ```ts
   * this.log.error("This is an error log");
   * this.log.error("This is an error {key}", {"key": "log"});
   * ```
   * ```ts
   * this.log.error(new BSBError("error-key", "This is an error log"));
   * this.log.error(new BSBError("error-key", "This is an error {key}", {"key": "log"}));
   * ```
   */
  public error<T extends string>(
      message: T,
      ...meta: SmartLogMeta<T>
  ): void;
  public error<T extends string>(error: BSBError<T>): void;
  public error<T extends string | BSBError<string>>(
      messageOrError: T,
      ...meta: T extends string ? SmartLogMeta<T> : [undefined?]
  ): void {
    if (messageOrError instanceof BSBError) {
      if (messageOrError.raw !== null) {
        this.logging.logBus.emit(
            "error",
            this.pluginName,
            messageOrError.raw.message,
            messageOrError.raw.meta,
        );
        return;
      }
      this.logging.logBus.emit(
          "error",
          this.pluginName,
          messageOrError.message,
          {error: messageOrError},
      );
      return;
    }
    this.logging.logBus.emit(
        "error",
        this.pluginName,
        messageOrError,
        meta,
    );
  }
}
