import {v7 as uuidv7} from "uuid";
import {CleanStringStrength, Counter, Gauge, Histogram, IPluginMetrics, Span, Timer, Trace} from "../interfaces";
import {SBMetrics} from "../serviceBase";
import {BSBError} from "./errorMessages";
import {Tools} from "./tools";
import {MS_PER_NS, NS_PER_SEC} from "./base";

export class PluginMetrics
    implements IPluginMetrics {
  private metrics: SBMetrics;
  private pluginName: string;
  private pluginNameSim: string;

  constructor(plugin: string, metrics: SBMetrics) {
    this.metrics = metrics;
    this.pluginName = plugin;
    this.pluginNameSim = Tools.cleanString(plugin, 50, CleanStringStrength.exhard, false);
  }

  public createCounter(name: string, description: string, help: string): Counter {
    if (!this.metrics.isReady) {
      throw new BSBError("Metrics not ready!");
    }
    this.metrics.metricsBus.emit("createCounter", this.pluginName, name, description, help);
    return {
      inc: (value: number, labels?: Record<string, string>) => {
        this.metrics.metricsBus.emit("updateCounter", "inc", this.pluginName, name, value, labels);
      },
    };
  }

  public createGauge(name: string, description: string, help: string): Gauge {
    if (!this.metrics.isReady) {
      throw new BSBError("Metrics not ready!");
    }
    this.metrics.metricsBus.emit("createGauge", this.pluginName, name, description, help);
    return {
      set: (value: number, labels?: Record<string, string>) => {
        this.metrics.metricsBus.emit("updateGauge", "set", this.pluginName, name, value, labels);
      },
      increment: (value: number = 1, labels?: Record<string, string>) => {
        this.metrics.metricsBus.emit("updateGauge", "inc", this.pluginName, name, value, labels);
      },
      decrement: (value: number = 1, labels?: Record<string, string>) => {
        this.metrics.metricsBus.emit("updateGauge", "dec", this.pluginName, name, value, labels);
      },
    };
  }

  public createHistogram(name: string, description: string, help: string, boundaries?: number[] | undefined): Histogram {
    if (!this.metrics.isReady) {
      throw new BSBError("Metrics not ready!");
    }
    this.metrics.metricsBus.emit("createHistogram", this.pluginName, name, description, help, boundaries);
    return {
      record: (value: number, labels?: Record<string, string>) => {
        this.metrics.metricsBus.emit("updateHistogram", "record", this.pluginName, name, value, labels);
      },
    };
  }

  public createTrace(parentId?: string): Trace {
    if (!this.metrics.isReady) {
      throw new BSBError("Metrics not ready!");
    }
    const context = this;
    const traceId = parentId ?? this.pluginNameSim + "-" + uuidv7();
    if (parentId === undefined) {
      context.metrics.metricsBus.emit("startTrace", context.pluginName, traceId);
    }
    return {
      id: traceId,
      createSpan(name: string, parentSpanId?: string, attributes?: Record<string, string>): Span {
        const spanId = parentSpanId ?? traceId + ":" + uuidv7();
        if (parentSpanId
            === undefined) {
          context.metrics.metricsBus.emit("startSpan", context.pluginName, traceId, spanId, name, attributes);
        }
        return {
          id: spanId,
          traceId: traceId,
          end: () => {
            context.metrics.metricsBus.emit("endSpan", context.pluginName, traceId, spanId, attributes);
          },
          error: (error: BSBError<any> | Error) => {
            context.metrics.metricsBus.emit("errorSpan", context.pluginName, traceId, spanId, error, attributes);
          },
        };
      },
      end: (attributes?: Record<string, string>) => {
        context.metrics.metricsBus.emit("endTrace", context.pluginName, traceId, attributes);
      },
    };
  }

  public createTimer(): Timer {
    if (!this.metrics.isReady) {
      throw new BSBError("Metrics not ready!");
    }
    const start = process.hrtime();
    return {
      stop: () => {
        const diff = process.hrtime(start);
        return (
            diff[0] * NS_PER_SEC + diff[1]
        ) * MS_PER_NS;
      }
    }
  }
}