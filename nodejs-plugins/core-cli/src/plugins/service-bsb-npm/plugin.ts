import {existsSync} from "node:fs";
import {join} from "node:path";
import {z} from "zod";
import {
  BSBPluginConfig,
  BSBPluginEvents,
  BSBService,
  BSBServiceConstructor,
  ServiceEventsBase,
} from "@bettercorp/service-base";
import {writeFileSync} from "node:fs";

export type NPMConfig = {
  "name": string;
  "license": string;
  "repository": {
    "url": string;
  } | undefined,
  "engines": {
    "npm": string;
    "node": string;
  } | undefined,
  "scripts": Record<string, string> | undefined,
  "files": string[] | undefined,
  "main": string | undefined,
  "version": string | undefined,
  "devDependencies": Record<string, string> | undefined,
  "dependencies": Record<string, string> | undefined,
}


export const secSchema = z.object({});

export class Config
    extends BSBPluginConfig<typeof secSchema> {
  validationSchema = secSchema;

  migrate(
      toVersion: string,
      fromVersion: string | null,
      fromConfig: any | null,
  ) {
    return fromConfig;
  }
}

export interface ServiceTypes
    extends BSBPluginEvents {
  onEvents: ServiceEventsBase;
  emitEvents: ServiceEventsBase;
  onReturnableEvents: {
    isNPMInitialized: (workingDir: string) => Promise<boolean>;
    initNPM: (workingDir: string) => Promise<boolean>;
    getNPMConfig: (workingDir: string) => Promise<NPMConfig>;
    updateNPMConfig: (workingDir: string, config: NPMConfig) => Promise<void>;
  };
  emitReturnableEvents: ServiceEventsBase;
  onBroadcast: ServiceEventsBase;
  emitBroadcast: ServiceEventsBase;
}

export class Plugin
    extends BSBService<Config, ServiceTypes> {
  public static PLUGIN_CLIENT = {
    name: "service-bsb-npm",
  };
  public initBeforePlugins?: string[] | undefined;
  public initAfterPlugins?: string[] | undefined;
  public runBeforePlugins?: string[] | undefined;
  public runAfterPlugins?: string[] | undefined;
  public methods = {};

  dispose?(): void;

  constructor(config: BSBServiceConstructor) {
    super(config);
  }

  private getNPMFilePath(workingDir: string) {
    return join(workingDir, "package.json");
  }
  public async init() {
    await this.events.onReturnableEvent("isNPMInitialized", async (workingDir: string) =>
        existsSync(join(workingDir, "package.json")),
    );
    await this.events.onReturnableEvent("initNPM", async (workingDir: string) =>
        writeFileSync(this.getNPMFilePath(workingDir), JSON.stringify({}, null, 2)),
    );
    await this.events.onReturnableEvent("getNPMConfig", async (workingDir: string) =>
        this.getNPMConfig(workingDir),
    );
    await this.events.onReturnableEvent("updateNPMConfig", async (workingDir: string, config: NPMConfig) =>
        this.updateNPMConfig(workingDir, config),
    );
  }

  public async run() {
  }
}
