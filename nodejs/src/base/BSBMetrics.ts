import {BaseWithConfig, BaseWithConfigConfig} from "./base";
import {BSB_ERROR_METHOD_NOT_IMPLEMENTED, BSBError} from "./errorMessages";
import {BSBReferencePluginConfigDefinition, BSBReferencePluginConfigType} from "./pluginConfig";

export interface BSBMetricsConstructor<
    ReferencedConfig extends BSBReferencePluginConfigType = any
>
    extends BaseWithConfigConfig<
        ReferencedConfig extends null
            ? null
            : BSBReferencePluginConfigDefinition<ReferencedConfig>
    > {
}

/**
 * @group Metrics
 * @category Plugin Development
 * @template T - The type of config for the plugin
 * Abstract class representing the configuration for the Better Service Base.
 */
export abstract class BSBMetrics<
    ReferencedConfig extends BSBReferencePluginConfigType = any
>
    extends BaseWithConfig<
        ReferencedConfig extends null
            ? null
            : BSBReferencePluginConfigDefinition<ReferencedConfig>
    > {
  constructor(config: BSBMetricsConstructor<ReferencedConfig>) {
    super(config);
  }

  public abstract createCounter(timestamp: number, pluginName: string, name: string, description: string, help: string, labels?: string[]): void | Promise<void>;

  public abstract updateCounter(timestamp: number, event: "inc", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract createGauge(timestamp: number, pluginName: string, name: string, description: string, help: string, labels?: string[]): void | Promise<void>;

  public abstract updateGauge(timestamp: number, event: "set" | "inc" | "dec", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract createHistogram(timestamp: number, pluginName: string, name: string, description: string, help: string, boundaries?: number[], labels?: string[]): void | Promise<void>;

  public abstract updateHistogram(timestamp: number, event: "record", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract startTrace(timestamp: number, pluginName: string, traceId: string): void | Promise<void>;

  public abstract endTrace(timestamp: number, pluginName: string, traceId: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract startSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, name: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract endSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract errorSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, error: BSBError<any> | Error, attributes?: Record<string, string>): void | Promise<void>;
}

/**
 * @hidden
 * DO NOT REFERENCE/USE THIS CLASS - IT IS AN INTERNALLY REFERENCED CLASS
 */
export class BSBMetricsRef
    extends BSBMetrics {
  dispose?(): void;

  init?(): void;

  run?(): void;

  createCounter(timestamp: number, pluginName: string, name: string, description: string, help: string, labels?: string[]): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createCounter");
  }

  createGauge(timestamp: number, pluginName: string, name: string, description: string, help: string, labels?: string[]): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createGauge");
  }

  createHistogram(timestamp: number, pluginName: string, name: string, description: string, help: string, boundaries: number[] | undefined, labels?: string[]): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createHistogram");
  }

  endSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, attributes: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "endSpan");
  }

  endTrace(timestamp: number, pluginName: string, traceId: string, attributes: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "endTrace");
  }

  errorSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, error: BSBError<any> | Error, attributes: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "errorSpan");
  }

  startSpan(timestamp: number, pluginName: string, traceId: string, spanId: string, name: string, attributes: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "startSpan");
  }

  startTrace(timestamp: number, pluginName: string, traceId: string): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "startTrace");
  }

  updateCounter(timestamp: number, event: "inc", pluginName: string, name: string, value: number, labels: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "counterEvent");
  }

  updateGauge(timestamp: number, event: "set" | "inc" | "dec", pluginName: string, name: string, value: number, labels: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "gaugeEvent");
  }

  updateHistogram(timestamp: number, event: "record", pluginName: string, name: string, value: number, labels: Record<string, string> | undefined): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "histogramEvent");
  }
}