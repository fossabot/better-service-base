/* eslint-disable @typescript-eslint/no-unused-vars */
import {LogMeta} from "../interfaces";
import {BaseWithConfig, BaseWithConfigConfig} from "./base";
import {BSB_ERROR_METHOD_NOT_IMPLEMENTED} from "./errorMessages";
import {BSBReferencePluginConfigDefinition, BSBReferencePluginConfigType} from "./pluginConfig";

export interface BSBLoggingConstructor<
    ReferencedConfig extends BSBReferencePluginConfigType = any
>
    extends BaseWithConfigConfig<
        ReferencedConfig extends null
        ? null
        : BSBReferencePluginConfigDefinition<ReferencedConfig>
    > {
}

/**
 * @group Logging
 * @category Plugin Development
 */
export abstract class BSBLogging<
    ReferencedConfig extends BSBReferencePluginConfigType = any
>
    extends BaseWithConfig<
        ReferencedConfig extends null
        ? null
        : BSBReferencePluginConfigDefinition<ReferencedConfig>
    > {
  constructor(config: BSBLoggingConstructor<ReferencedConfig>) {
    super(config);
  }

  /**
   * This function is never used for events plugins.
   * @ignore @deprecated
   */
  public run() {
  }

  /**
   * Debug
   * Logs an debug message
   *
   * @param plugin - The name of the plugin that wants to log
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @see BSB logging-default plugin for an example of how to use this function
   * @see {@link https://github.com/BetterCorp/better-service-base/tree/master/nodejs/src/plugins/logging-default | Default Logging Plugin}
   */
  public abstract debug<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T>,
  ): Promise<void> | void;

  /**
   * Info
   * Logs an info message
   *
   * @param plugin - The name of the plugin that wants to log
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @see BSB logging-default plugin for an example of how to use this function
   * @see {@link https://github.com/BetterCorp/better-service-base/tree/master/nodejs/src/plugins/logging-default | Default Logging Plugin}
   */
  public abstract info<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T>,
  ): Promise<void> | void;

  /**
   * Warn
   * Logs an warn message
   *
   * @param plugin - The name of the plugin that wants to log
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @see BSB logging-default plugin for an example of how to use this function
   * @see {@link https://github.com/BetterCorp/better-service-base/tree/master/nodejs/src/plugins/logging-default | Default Logging Plugin}
   */
  public abstract warn<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T>,
  ): Promise<void> | void;

  /**
   * Error
   * Logs an error message
   *
   * @param plugin - The name of the plugin that wants to log
   * @param message - The message to log
   * @param meta - Additional information to log with the message
   * @returns nothing
   *
   * @see BSB logging-default plugin for an example of how to use this function
   * @see {@link https://github.com/BetterCorp/better-service-base/tree/master/nodejs/src/plugins/logging-default | Default Logging Plugin}
   */
  public abstract error<T extends string>(
      plugin: string,
      messageOrError: T,
      errorOrMeta?: Error | LogMeta<T>,
      meta?: LogMeta<T>,
  ): Promise<void> | void;
}

/**
 * @hidden
 * DO NOT REFERENCE/USE THIS CLASS - IT IS AN INTERNALLY REFERENCED CLASS
 */
export class BSBLoggingRef
    extends BSBLogging<null> {
  public debug<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T> | undefined,
  ): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBLoggingRef", "debug");
  }

  public info<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T> | undefined,
  ): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBLoggingRef", "info");
  }

  public warn<T extends string>(
      plugin: string,
      message: T,
      meta?: LogMeta<T> | undefined,
  ): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBLoggingRef", "warn");
  }

  public error<T extends string>(
      plugin: string,
      messageOrError: T,
      errorOrMeta?: Error | LogMeta<T>,
      meta?: LogMeta<T>,
  ): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBLoggingRef", "error");
  }

  dispose?(): void;

  init?(): void;
}
