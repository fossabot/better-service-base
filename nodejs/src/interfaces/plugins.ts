import {
  BSBConfig, BSBConfigRef,
  BSBEvents,
  BSBEventsRef,
  BSBLogging,
  BSBLoggingRef,
  BSBMetrics, BSBMetricsRef, BSBPluginConfig,
  BSBService,
  BSBServiceRef,
} from "../base";
import {EventsEventTypes} from "./events";
import {LoggingEventTypes} from "./logging";

/**
 * @hidden
 */
export const PluginTypes = {
  config: "config",
  events: "events",
  logging: "logging",
  service: "service",
  metrics: "metrics",
} as const;

/**
 * @hidden
 */
export type PluginType = (typeof PluginTypes)[keyof typeof PluginTypes];

/**
 * Marks all properties of an object read only and all nested objects read only
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer R)[]
                           ? DeepReadonlyArray<R>
                           : T[P] extends Function
                             ? T[P]
                             : T[P] extends object
                               ? DeepReadonly<T[P]>
                               : T[P];
};

/**
 * Marks all properties of an array read only and all nested objects read only
 */
export interface DeepReadonlyArray<T>
    extends ReadonlyArray<DeepReadonly<T>> {
}

/**
 * @hidden
 */
export interface IPluginDefinition {
  package?: string | null;
  plugin: string;
  name: string;
  version: string;
}

/**
 * @hidden
 */
export interface IPluginBuilder {
  name: string;
  pluginName: string;
  version: string;
  pluginFile: string;
  pluginDir: string;
  installerFile: string | null;
}

/**
 * @hidden
 */
export type PluginTypeDefinition<T extends PluginType> =
    T extends typeof PluginTypes.service
    ? BSBService
    : T extends typeof PluginTypes.logging
      ? BSBLogging<any>
      : T extends typeof PluginTypes.config
        ? BSBConfig
        : T extends typeof PluginTypes.events
          ? BSBEvents
          : T extends typeof PluginTypes.metrics
            ? BSBMetrics
            : never;

/**
 * @hidden
 */
export type PluginTypeDefinitionRef<T extends PluginType> =
    T extends typeof PluginTypes.service
    ? typeof BSBServiceRef
    : T extends typeof PluginTypes.logging
      ? typeof BSBLoggingRef
      : T extends typeof PluginTypes.config
        ? typeof BSBConfigRef
        : T extends typeof PluginTypes.events
          ? typeof BSBEventsRef
          : T extends typeof PluginTypes.metrics
            ? typeof BSBMetricsRef
            : never;

/**
 * @hidden
 */
export interface IPluginBuilt<T extends PluginType>
    extends IPluginBuilder {
  config: any;
  plugin: PluginTypeDefinition<T>;
}

/**
 * @hidden
 */
export interface PluginDefinition {
  package?: string | null;
  version: string | null;
  plugin: string;
  //name: string;
  enabled: boolean;
}

/**
 * @hidden
 */
export type FilterDetailed<T extends string | number | symbol = any> = Record<
    T,
    {
      plugins: Array<string>;
      enabled: boolean;
    }
>;
/**
 * @hidden
 */
export type LoggingFilterDetailed = FilterDetailed<LoggingEventTypes>;

/**
 * @hidden
 */
export type LoggingFilter =
    | LoggingFilterDetailed // eventsDetailed
    | Record<LoggingEventTypes, boolean> // eventsState
    | Record<LoggingEventTypes, Array<string>> // eventsPlugins
    | Array<LoggingEventTypes>; // events

/**
 * @hidden
 */
export interface LoggingConfig
    extends PluginDefinition {
  filter?: LoggingFilter;
}

/**
 * @hidden
 */
export type EventsFilterDetailed = FilterDetailed<EventsEventTypes>;

/**
 * @hidden
 */
export type EventsFilter =
    | EventsFilterDetailed // eventsDetailed
    | Record<EventsEventTypes, boolean> // eventsState
    | Record<EventsEventTypes, Array<string>> // eventsPlugins
    | Array<EventsEventTypes>; // events

/**
 * @hidden
 */
export interface EventsConfig
    extends PluginDefinition {
  filter?: EventsFilter;
}

/**
 * @hidden
 */
export type FilterOnType = // see EventsFilter and LoggingFilter for more details
    "all" | "events" | "eventsState" | "eventsPlugins" | "eventsDetailed";

/**
 * @hidden
 */
export interface LoadedPlugin<
    NamedType extends PluginType,
    ClassType extends PluginTypeDefinitionRef<NamedType> = PluginTypeDefinitionRef<NamedType>
> {
  name: string;
  ref: string;
  version: string;
  serviceConfig: BSBPluginConfig<any> | null;
  plugin: ClassType;
  packageCwd: string;
  pluginCwd: string;
  pluginPath: string;
}