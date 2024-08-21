import {EventEmitter} from "node:events";
import {BSBMetrics, PluginLogger, SmartFunctionCallAsync, SmartFunctionCallSync} from "../base";
import {DEBUG_MODE, IPluginDefinition, IPluginLogger, LoadedPlugin} from "../interfaces";
import {SBConfig} from "./config";
import {SBLogging} from "./logging";
import {SBPlugins} from "./plugins";

/**
 * BSB Metrics Controller
 * @group Metrics
 * @category Extending BSB
 */
export class SBMetrics {
  private metricsPlugins: Array<BSBMetrics<any>> = [];
  public metricsBus: EventEmitter = new EventEmitter();
  private mode: DEBUG_MODE = "development";
  private appId: string;
  private cwd: string;
  private sbPlugins: SBPlugins;
  private log: IPluginLogger;
  private _ready = false;

  public get isReady() {
    return this._ready;
  }

  constructor(
      appId: string,
      mode: DEBUG_MODE,
      cwd: string,
      sbPlugins: SBPlugins,
      sbLogging: SBLogging,
  ) {
    this.appId = appId;
    this.mode = mode;
    this.cwd = cwd;
    this.sbPlugins = sbPlugins;
    const metricsPluginName = "core-metrics";
    this.log = new PluginLogger(this.mode, metricsPluginName, sbLogging);

    this.metricsBus.on("createCounter", async (timestamp: number, pluginName, name, description, help, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.createCounter, timestamp, pluginName, name, description, help, labels);
      }
    });
    this.metricsBus.on("createGauge", async (timestamp: number, pluginName, name, description, help, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.createGauge, timestamp, pluginName, name, description, help, labels);
      }
    });
    this.metricsBus.on("createHistogram", async (timestamp: number, pluginName, name, description, help, boundaries, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.createHistogram, timestamp, pluginName, name, description, help, boundaries, labels);
      }
    });
    this.metricsBus.on("updateCounter", async (timestamp: number, event: "inc", pluginName, name, value, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.updateCounter, timestamp, event, pluginName, name, value, labels);
      }
    });
    this.metricsBus.on("updateGauge", async (timestamp: number, event: "set" | "inc" | "dec", pluginName, name, value, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.updateGauge, timestamp, event, pluginName, name, value, labels);
      }
    });
    this.metricsBus.on("updateHistogram", async (timestamp: number, event: "record", pluginName, name, value, labels) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.updateHistogram, timestamp, event, pluginName, name, value, labels);
      }
    });
    this.metricsBus.on("startTrace", async (timestamp: number, pluginName, traceId) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.startTrace, timestamp, pluginName, traceId);
      }
    });
    this.metricsBus.on("endTrace", async (timestamp: number, pluginName, traceId, attributes) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.endTrace, timestamp, pluginName, traceId, attributes);
      }
    });
    this.metricsBus.on("startSpan", async (timestamp: number, pluginName, traceId, spanId, name, attributes) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.startSpan, timestamp, pluginName, traceId, spanId, name, attributes);
      }
    });
    this.metricsBus.on("endSpan", async (timestamp: number, pluginName, traceId, spanId, attributes) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.endSpan, timestamp, pluginName, traceId, spanId, attributes);
      }
    });
    this.metricsBus.on("errorSpan", async (timestamp: number, pluginName, traceId, spanId, error, attributes) => {
      for (const plugin of this.metricsPlugins) {
        await SmartFunctionCallAsync(plugin, plugin.errorSpan, timestamp, pluginName, traceId, spanId, error, attributes);
      }
    });
  }

  public dispose() {
    for (const plugin of this.metricsPlugins) {
      if (plugin.dispose !== undefined) {
        SmartFunctionCallSync(plugin, plugin.dispose);
      }
    }
    this.metricsBus.removeAllListeners();
  }

  public async init(sbConfig: SBConfig) {
    this.log.debug("INIT SBMetrics");
    const plugins = await sbConfig.getMetricsPlugins();
    for (const plugin of Object.keys(plugins)) {
      await this.addMetricsPlugin(sbConfig, {
        name: plugin,
        package: plugins[plugin].package,
        plugin: plugins[plugin].plugin,
        version: "",
      });
    }
    this._ready = true;
  }

  public async addPlugin(
      plugin: IPluginDefinition,
      reference: LoadedPlugin<"metrics">,
      config: any,
  ) {
    this.log.debug(`Construct metrics plugin: {name}`, {
      name: plugin.name,
    });

    const metricsPlugin = new reference.plugin({
      appId: this.appId,
      mode: this.mode,
      pluginName: reference.name,
      cwd: this.cwd,
      packageCwd: reference.packageCwd,
      pluginCwd: reference.pluginCwd,
      config: config,
    });

    this.metricsPlugins.push(metricsPlugin);

    this.log.info("Ready {pluginName} ({mappedName})", {
      pluginName: plugin.plugin,
      mappedName: plugin.name,
    });

    await SmartFunctionCallAsync(metricsPlugin, metricsPlugin.init);

    return metricsPlugin;
  }

  private async addMetricsPlugin(
      sbConfig: SBConfig,
      plugin: IPluginDefinition,
  ) {
    this.log.debug("Add metrics plugin {name} from ({package}){file}", {
      package: plugin.package ?? "-",
      name: plugin.name,
      file: plugin.plugin,
    });

    const newPlugin = await this.sbPlugins.loadPlugin<"metrics">(
        this.log,
        plugin.package ?? null,
        plugin.plugin,
        plugin.name,
    );
    if (newPlugin === null) {
      this.log.error(
          "Failed to import metrics plugin: {name} from ({package}){file}",
          {
            package: plugin.package ?? "-",
            name: plugin.name,
            file: plugin.plugin,
          },
      );
      return;
    }

    this.log.debug(`Get plugin config: {name}`, {
      name: plugin.name,
    });

    let pluginConfig =
        (
            await sbConfig.getPluginConfig("metrics", plugin.name)
        ) ?? null;

    if (
        newPlugin.serviceConfig?.validationSchema
    ) {
      this.log.debug("Validate plugin config: {name}", {name: plugin.name});
      pluginConfig = newPlugin.serviceConfig.validationSchema.parse(pluginConfig ?? undefined);
    }

    await this.addPlugin(plugin, newPlugin, pluginConfig);
  }
}