import {BSBError, BSBMetrics, BSBMetricsConstructor} from "@bettercorp/service-base";
import {CONSOLE_COLOURS} from "@bettercorp/service-base/lib/plugins/logging-default/colours";
import * as client from "prom-client";

interface MetricData {
  value: number;
  labels?: Record<string, string>;
  ref: client.Counter | client.Gauge | client.Histogram;
}

export class Plugin
    extends BSBMetrics<any> {

  private traces: Array<{
    id: string;
    startTime: number;
    endTime?: number;
    pluginName: string;
    attributes?: Record<string, string>;
    spans: Array<{
      id: string;
      pluginName: string;
      startTime: number;
      endTime?: number;
      name: string;
      error?: Error | BSBError<any>;
      attributes?: Record<string, string>;
    }>;
  }> = [];

  public startTrace(timestamp:number, pluginName: string, traceId: string): void | Promise<void> {
    this.traces.push({
      id: traceId,
      startTime: new Date().getTime(),
      pluginName: pluginName,
      spans: [],
    });
    console.log("startTrace: " + traceId);
  }

  public endTrace(timestamp:number, pluginName: string, traceId: string, attributes?: Record<string, string>): void | Promise<void> {
    const trace = this.traces.find((x) => x.id === traceId);
    if (trace === undefined) {
      throw new BSBError("No trace found with id: " + traceId);
    }
    trace.endTime = new Date().getTime();
    trace.attributes = attributes;
    /// output traces and spans in visual  on the console
    const formattedMessage = `${trace.pluginName} ${trace.id} ${trace.startTime} ${trace.endTime} ${JSON.stringify(trace.attributes
                                                                                                                   ?? {})}`;
    console.log([
                  CONSOLE_COLOURS.BgBlue,
                  CONSOLE_COLOURS.FgWhite,
                ].join("") + "%s" + CONSOLE_COLOURS.Reset, formattedMessage);
    for (const span of trace.spans) {
      const formattedMessage = ` > ${span.name} ${span.id} ${span.startTime} ${span.endTime} ${JSON.stringify(span.attributes
                                                                                                              ?? {})}`;
      console.log([
                    CONSOLE_COLOURS.BgCyan,
                    CONSOLE_COLOURS.FgWhite,
                  ].join("") + "%s" + CONSOLE_COLOURS.Reset, formattedMessage);
    }
  }

  public startSpan(timestamp:number, pluginName: string, traceId: string, spanId: string, name: string, attributes?: Record<string, string>): void | Promise<void> {
    const trace = this.traces.find((x) => x.id === traceId);
    if (trace === undefined) {
      throw new BSBError("No trace found with id: " + traceId);
    }
    trace.spans.push({
      id: spanId,
      pluginName: pluginName,
      startTime: new Date().getTime(),
      name: name,
      attributes: attributes,
    });
  }

  public endSpan(timestamp:number, pluginName: string, traceId: string, spanId: string, attributes?: Record<string, string>): void | Promise<void> {
    const trace = this.traces.find((x) => x.id === traceId);
    if (trace === undefined) {
      throw new BSBError("No trace found with id: " + traceId);
    }
    const span = trace.spans.find((x) => x.id === spanId);
    if (span === undefined) {
      throw new BSBError("No span found with id: " + spanId);
    }
    span.attributes = {
      ...(
          attributes ?? {}
      ), ...(
          span.attributes ?? {}
      ),
    };
    span.endTime = new Date().getTime();
  }

  public errorSpan(timestamp:number, pluginName: string, traceId: string, spanId: string, error: BSBError<any> | Error, attributes?: Record<string, string>): void | Promise<void> {
    const trace = this.traces.find((x) => x.id === traceId);
    if (trace === undefined) {
      throw new BSBError("No trace found with id: " + traceId);
    }
    const span = trace.spans.find((x) => x.id === spanId);
    if (span === undefined) {
      throw new BSBError("No span found with id: " + spanId);
    }
    span.attributes = {
      ...(
          attributes ?? {}
      ), ...(
          span.attributes ?? {}
      ),
    };
    span.error = error;
    span.endTime = new Date().getTime();
  }

  dispose?(): void;

  init?(): void;

  run?(): void;

  private metrics: Record<string, Record<string, MetricData>> = {
    counter: {},
    gauge: {},
    histogram: {},
  };

  private registry: client.Registry;

  constructor(config: BSBMetricsConstructor) {
    super(config);
    const Registry = client.Registry;
    this.registry = new Registry();
    const defaultLabels = {NODE_APP_INSTANCE: this.appId};
    client.register.setDefaultLabels(defaultLabels);
    const collectDefaultMetrics = client.collectDefaultMetrics;
    setInterval(() => {
      collectDefaultMetrics({
        labels: {NODE_APP_INSTANCE: this.appId},
      });
      let gateway = new client.Pushgateway("http://127.0.0.1:9091", [], this.registry);
      gateway.pushAdd({jobName: "bsb"})
             .then(({resp, body}) => {
               console.log("PROM READY");
             })
             .catch(err => {
               console.error(err);
             });
    }, 1000);
  }

  private async updateMetric<TK extends "counter" | "gauge" | "histogram">(type: TK, event:
      TK extends "counter" ? "inc" : TK extends "gauge" ? "set" | "inc" | "dec" : TK extends "histogram" ? "record"
                                                                                                         : never, name: string, value?: number, labels?: Record<string, string>) {
    name = name.replaceAll(".", "_")
               .replaceAll("-", "_") + "_" + type;
    if (!this.metrics[type][name]) {
      throw new Error("metric not found: " + name);
    }

    if (labels) {
      this.metrics[type][name].labels = {...this.metrics[type][name].labels, ...labels};
    }

    //let finalValue = value;
    if (type === "counter") {
      let refAs = this.metrics[type][name].ref as client.Counter;
      refAs.inc(value);
      this.metrics[type][name].value = this.metrics[type][name].value + (
          value ?? 0
      );
      //finalValue = value;
    }
    else if (type === "gauge") {
      let refAs = this.metrics[type][name].ref as client.Gauge;
      if (event === "set") {
        //refAs.set(labels??{}, value??0);
        refAs.set({}, value ?? 0);
        this.metrics[type][name].value = value ?? 0;
      }
      else if (event === "inc") {
        refAs.inc(value);
        this.metrics[type][name].value = this.metrics[type][name].value + (
            value ?? 0
        );
      }
      else if (event === "dec") {
        refAs.dec(value);
        this.metrics[type][name].value = this.metrics[type][name].value - (
            value ?? 0
        );
      }
    }
    else if (type === "histogram") {
      //let refAs = this.metrics[type][name].ref as client.Histogram;
      if (event === "record") {
        //refAs.observe(value, labels??{});
      }
    }
    else {
      throw new Error("Unknown metric type [" + type + "]");
    }

    const formattedMessage = `${type} ${name} ${this.metrics[type][name].value} ${JSON.stringify(this.metrics[type][name].labels
                                                                                                 ?? "no labels")}`;

    console.log([
                  CONSOLE_COLOURS.BgCyan,
                  CONSOLE_COLOURS.FgWhite,
                ].join("") + "%s" + CONSOLE_COLOURS.Reset, formattedMessage);
  }

  createCounter(timestamp:number, pluginName: string, name: string, description?: string): void {
    const type = "counter";
    name = name.replaceAll(".", "_")
               .replaceAll("-", "_") + "_" + type;
    if (this.metrics[type][name]) {
      return;
    }
    console.log("creating method " + type + " for " + name);
    this.metrics[type][name] = {
      value: 1,
      labels: {},
      ref: new client.Counter({
        name,
        help: "sdsd",
      }),
    };
    this.registry.registerMetric(this.metrics[type][name].ref);
  }

  createGauge(timestamp:number, pluginName: string, name: string, description?: string): void {
    const type = "gauge";
    name = name.replaceAll(".", "_")
               .replaceAll("-", "_") + "_" + type;
    if (this.metrics[type][name]) {
      return;
    }
    console.log("creating method " + type + " for " + name);
    this.metrics[type][name] = {
      value: 1,
      labels: {},
      ref: new client.Gauge({
        name,
        help: "aa",
        aggregator: "max",
      }),
    };
    this.registry.registerMetric(this.metrics[type][name].ref);
  }

  createHistogram(timestamp:number, pluginName: string, name: string, description?: string, boundaries?: number[] | undefined): void {
    const type = "histogram";
    name = name.replaceAll(".", "_")
               .replaceAll("-", "_") + "_" + type;
    if (this.metrics[type][name]) {
      return;
    }
    console.log("creating method " + type + " for " + name);
    this.metrics[type][name] = {
      value: 1,
      labels: {},
      ref: new client.Histogram({
        name,
        help: "aad",
      }),
    };
    this.registry.registerMetric(this.metrics[type][name].ref);
  }

  updateCounter(timestamp:number, event: "inc", pluginName: string, name: string, value: number, labels?: Record<string, string> | undefined): void {
    this.updateMetric("counter", event, name, value, labels);
  }

  updateGauge(event: "set" | "inc" | "dec", timestamp:number, pluginName: string, name: string, value: number, labels?: Record<string, string> | undefined): void {
    this.updateMetric("gauge", event, name, value, labels);
  }

  updateHistogram(timestamp:number, event: "record", pluginName: string, name: string, value: number, labels?: Record<string, string> | undefined): void {
    this.updateMetric("histogram", event, name, value, labels);
  }
}