import {join} from "node:path";
import {z} from "zod";
import {
  BSBPluginConfig,
  BSBPluginEvents,
  BSBService,
  BSBServiceConstructor,
  ServiceEventsBase,
} from "@bettercorp/service-base";
import {exec} from "child_process";
import {existsSync} from "node:fs";

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
    gitIsInitialized: (workingDir: string) => Promise<boolean>;
    gitInit: (workingDir: string) => Promise<boolean>;
  };
  emitReturnableEvents: ServiceEventsBase;
  onBroadcast: ServiceEventsBase;
  emitBroadcast: ServiceEventsBase;
}

export class Plugin
    extends BSBService<Config, ServiceTypes> {
  public static PLUGIN_CLIENT = {
    name: "service-bsb-git",
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

  public async init() {
    await this.events.onReturnableEvent("gitIsInitialized", async (workingDir: string) =>
        existsSync(join(workingDir, ".git")),
    );
    await this.events.onReturnableEvent("gitInit", async (workingDir: string) => new Promise<boolean>(async (resolve) => {
      exec("git init", {encoding: "utf-8", cwd: workingDir}, function (error, stdout, stderr) {
        return resolve((
            stdout + stderr
        ).includes("Initialized empty Git repository"));
      });
    }));
  }

  public async run() {
  }
}
