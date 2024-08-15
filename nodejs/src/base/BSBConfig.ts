/* eslint-disable @typescript-eslint/no-unused-vars */
import {EventsConfig, LoggingConfig, PluginDefinition, PluginType} from "../interfaces";
import {BaseWithLogging, BaseWithLoggingConfig} from "./base";
import {BSB_ERROR_METHOD_NOT_IMPLEMENTED} from "./errorMessages";

/**
 * @hidden
 */
export type BSBConfigConstructor = BaseWithLoggingConfig;

/**
 * @group Config
 * @category Plugin Development
 * @template T - The type of config for the plugin
 * Abstract class representing the configuration for the Better Service Base.
 */
export abstract class BSBConfig
    extends BaseWithLogging {
  constructor(config: BSBConfigConstructor) {
    super(config);
  }

  /**
   * This function is never used for events plugins.
   * @ignore @deprecated
   */
  public run() {
  }

  /**
   * Returns the logging plugins configuration.
   * @returns Promise resolving to an object containing the logging configuration for each plugin.
   */
  abstract getLoggingPlugins(): Promise<Record<string, LoggingConfig>>;

  /**
   * Returns the metrics plugins configuration.
   * @returns Promise resolving to an object containing the metrics configuration for each plugin.
   */
  abstract getMetricsPlugins(): Promise<Record<string, PluginDefinition>>;

  /**
   * Returns the events plugins configuration.
   * @returns Promise resolving to an object containing the events configuration for each plugin.
   */
  abstract getEventsPlugins(): Promise<Record<string, EventsConfig>>;

  /**
   * Returns the service plugins configuration.
   * @returns Promise resolving to an object containing the configuration for each plugin.
   */
  abstract getServicePlugins(): Promise<Record<string, PluginDefinition>>;

  /**
   * Returns a mapped plugin name and whether the plugin is enabled or not
   * @returns string of the plugin name and if it is enabled or not
   */
  abstract getServicePluginDefinition(
      pluginName: string,
  ): Promise<{ name: string; enabled: boolean }>;

  /**
   * Returns the configuration for a specific plugin.
   * @template T - The type of the configuration object.
   * @param plugin - The name of the plugin to retrieve the configuration for.
   * @returns Promise resolving to the configuration object for the specified plugin, or null if the plugin is not found.
   */
  abstract getPluginConfig(
      pluginType: PluginType,
      plugin: string,
  ): Promise<object | null>;
}

/**
 * @hidden
 */
export class BSBConfigRef
    extends BSBConfig {
  getLoggingPlugins(): Promise<Record<string, LoggingConfig>> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBConfigRef", "getLoggingPlugins");
  }

  getMetricsPlugins(): Promise<Record<string, PluginDefinition>> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBConfigRef", "getMetricsPlugins");
  }

  getEventsPlugins(): Promise<Record<string, EventsConfig>> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBConfigRef", "getEventsPlugins");
  }

  getServicePlugins(): Promise<Record<string, PluginDefinition>> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBConfigRef", "getServicePlugins");
  }

  getPluginConfig(
      pluginType: PluginType,
      plugin: string,
  ): Promise<object | null> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBConfigRef", "getPluginConfig");
  }

  getServicePluginDefinition(
      pluginName: string,
  ): Promise<{ name: string; enabled: boolean }> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED(
        "BSBConfigRef",
        "getServicePluginName",
    );
  }

  dispose?(): void;

  init?(): void;
}
