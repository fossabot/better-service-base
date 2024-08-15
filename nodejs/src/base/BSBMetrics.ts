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

  public abstract createCounter(pluginName: string, name: string, description?: string): void | Promise<void>;

  public abstract updateCounter(event: "inc", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract createGauge(pluginName: string, name: string, description?: string): void | Promise<void>;

  public abstract updateGauge(event: "set" | "inc" | "dec", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract createHistogram(pluginName: string, name: string, description?: string, boundaries?: number[] | undefined): void | Promise<void>;

  public abstract updateHistogram(event: "record", pluginName: string, name: string, value: number, labels?: Record<string, string>): void | Promise<void>;

  public abstract startTrace(pluginName: string, traceId: string): void | Promise<void>;

  public abstract endTrace(pluginName: string, traceId: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract startSpan(pluginName: string, traceId: string, spanId: string, name: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract endSpan(pluginName: string, traceId: string, spanId: string, attributes?: Record<string, string>): void | Promise<void>;

  public abstract errorSpan(pluginName: string, traceId: string, spanId: string, error: BSBError<any> | Error, attributes?: Record<string, string>): void | Promise<void>;
}

/**
 * @hidden
 * DO NOT REFERENCE/USE THIS CLASS - IT IS AN INTERNALLY REFERENCED CLASS
 */
export class BSBMetricsRef
    extends BSBMetrics {
  public startTrace(pluginName: string, traceId: string): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "startTrace");
  }

  public endTrace(pluginName: string, traceId: string, attributes?: Record<string, string>): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "endTrace");
  }

  public startSpan(pluginName: string, traceId: string, spanId: string, name: string, attributes?: Record<string, string>): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "startSpan");
  }

  public endSpan(pluginName: string, traceId: string, spanId: string, attributes?: Record<string, string>): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "endSpan");
  }

  public errorSpan(pluginName: string, traceId: string, spanId: string, error: BSBError<any> | Error, attributes?: Record<string, string>): void | Promise<void> {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "errorSpan");
  }

  public updateMetric(type: "counter" | "gauge" | "histogram", pluginName: string, name: string, value: number, labels?: Record<string, string>): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "updateMetric");
  }

  createCounter(pluginName: string, name: string, description?: string): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createCounter");
  }

  updateCounter(event: "inc", pluginName: string, name: string, value: number, labels?: Record<string, string>) {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "counterEvent");
  }

  createGauge(pluginName: string, name: string, description?: string): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createGauge");
  }

  updateGauge(event: "set" | "inc" | "dec", pluginName: string, name: string, value: number, labels?: Record<string, string>) {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "gaugeEvent");
  }

  createHistogram(pluginName: string, name: string, description?: string, boundaries?: number[] | undefined): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createHistogram");
  }

  updateHistogram(event: "record", pluginName: string, name: string, value: number, labels?: Record<string, string>) {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "histogramEvent");
  }

  createTrace(pluginName: string, name: string, description?: string): void {
    throw BSB_ERROR_METHOD_NOT_IMPLEMENTED("BSBMetricsRef", "createTrace");
  }

  dispose?(): void;

  init?(): void;

  run?(): void;


}