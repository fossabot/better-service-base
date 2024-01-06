import { DEBUG_MODE, IPluginLogger } from "../interfaces/logging";
import { Plugin as DefaultConfig } from "../plugins/config-default/plugin";
import { SBPlugins } from "./plugins";
import { SBLogging } from "./logging";
import { PluginLogger } from "../base/PluginLogger";
import { BSBConfig } from "../base/config";
import {
  SmartFunctionCallSync,
  SmartFunctionCallAsync,
} from "../base/functions";
import {
  EventsConfig,
  LoadedPlugin,
  LoggingConfig,
  PluginDefition,
  PluginType,
} from "../interfaces/plugins";
import { Tools } from "@bettercorp/tools/lib/Tools";

export class SBConfig {
  private mode: DEBUG_MODE = "development";
  private appId: string;
  private cwd: string;
  private sbPlugins: SBPlugins;
  private sbLogging: SBLogging;
  private log: IPluginLogger;
  private configPlugin: BSBConfig;
  constructor(
    appId: string,
    mode: DEBUG_MODE,
    cwd: string,
    sbLogging: SBLogging,
    sbPlugins: SBPlugins
  ) {
    this.appId = appId;
    this.mode = mode;
    this.cwd = cwd;
    this.sbLogging = sbLogging;
    this.sbPlugins = sbPlugins;
    this.log = new PluginLogger(mode, "sb-config", sbLogging);
    this.configPlugin = new DefaultConfig({
      appId,
      mode,
      pluginName: "sb-config",
      cwd,
      pluginCwd: cwd,
      sbLogging,
    });
  }

  public async getPluginConfig(pluginType: PluginType, name: string) {
    return await this.configPlugin.getPluginConfig(pluginType, name);
  }
  public async getServicePlugins(): Promise<Record<string, PluginDefition>> {
    return await this.configPlugin.getServicePlugins();
  }
  public async getEventsPlugins(): Promise<Record<string, EventsConfig>> {
    return await this.configPlugin.getEventsPlugins();
  }
  public async getLoggingPlugins(): Promise<Record<string, LoggingConfig>> {
    return await this.configPlugin.getLoggingPlugins();
  }
  public async getServicePluginDefinition(
    pluginName: string
  ): Promise<{ name: string; enabled: boolean }> {
    return await this.configPlugin.getServicePluginDefinition(pluginName);
  }
  public dispose() {
    SmartFunctionCallSync(this.configPlugin, this.configPlugin.dispose);
  }

  private configPackage: string | undefined;
  private configPluginName = "config-default";

  public async setConfigPlugin(reference: LoadedPlugin<"config">) {
    this.configPlugin = new reference.plugin({
      appId: this.appId,
      mode: this.mode,
      pluginName: reference.name,
      cwd: this.cwd,
      pluginCwd: reference.pluginCWD,
      sbLogging: this.sbLogging,
    });
    this.log.info("Adding {pluginName} as config", {
      pluginName: reference.name,
    });

    this.log.debug(`Init: {name}`, {
      name: this.configPluginName,
    });
    await SmartFunctionCallAsync(this.configPlugin, this.configPlugin.init);

    this.log.info(`Init: {name}: OK`, {
      name: this.configPluginName,
    });

    return this.configPlugin;
  }

  public async init(): Promise<void> {
    if (
      Tools.isString(process.env.BSB_LOGGER_PLUGIN) &&
      process.env.BSB_LOGGER_PLUGIN.startsWith("config-")
    ) {
      this.configPluginName = process.env.BSB_LOGGER_PLUGIN;
      if (Tools.isString(process.env.BSB_LOGGER_PLUGIN_PACKAGE)) {
        this.configPackage = process.env.BSB_LOGGER_PLUGIN_PACKAGE;
      }
    }
    this.log.debug("Add config {name} from ({package})", {
      package: this.configPackage ?? "this project",
      name: this.configPluginName,
    });
    if (this.configPluginName === "config-default") {
      await SmartFunctionCallAsync(this.configPlugin, this.configPlugin.init);
      return;
    }
    this.log.debug(`Import config plugin: {name} from ({package})`, {
      package: this.configPackage ?? "this project",
      name: this.configPluginName,
    });

    const newPlugin = await this.sbPlugins.loadPlugin<"config">(
      this.log,
      this.configPackage ?? null,
      this.configPluginName,
      this.configPluginName
    );
    if (newPlugin === null) {
      this.log.error(
        "Failed to import config plugin: {name} from ({package})",
        {
          package: this.configPackage ?? "this project",
          name: this.configPluginName,
        }
      );
      return;
    }

    await this.setConfigPlugin(newPlugin);
  }
}
