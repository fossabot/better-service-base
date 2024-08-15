import {existsSync} from "node:fs";
import {z} from "zod";
import {
  BSBPluginConfig,
  BSBPluginEvents,
  BSBService,
  BSBServiceConstructor, ServiceClient,
  ServiceEventsBase,
} from "@bettercorp/service-base";
import {confirm, input} from "@inquirer/prompts";
import {Plugin as GITPlugin} from "../service-bsb-git/plugin";
import {Plugin as NPMPlugin} from "../service-bsb-npm/plugin";

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
  onReturnableEvents: {};
  emitReturnableEvents: ServiceEventsBase;
  onBroadcast: ServiceEventsBase;
  emitBroadcast: ServiceEventsBase;
}

export class Plugin
    extends BSBService<Config, ServiceTypes> {
  public initBeforePlugins?: string[] | undefined;
  public initAfterPlugins?: string[] | undefined;
  public runBeforePlugins?: string[] | undefined;
  public runAfterPlugins?: string[] | undefined;
  public methods = {};
  private git: ServiceClient<GITPlugin>;
  private npm: ServiceClient<NPMPlugin>;

  dispose?(): void;

  constructor(config: BSBServiceConstructor) {
    super(config);
    this.git = new ServiceClient(GITPlugin, this);
    this.npm = new ServiceClient(NPMPlugin, this);
  }

  public async init() {
  }

  private projectInfo = {
    workingkingDir: process.cwd(),
    gitSetup: false,
    gitRemoteSetup: false,
    npmSetup: false,
    projectName: "",
    plugins: [] as string[],
  };

  /*private async gitHubProcess() {
   // const setupGH = await confirm({
   //   message: "Do you want to setup GitHub? (requires GitHub CLI installed and setup)",
   //   default: false,
   // });
   //
   // if (setupGH) {
   //   await this.gitHubProcess();
   // }    
   }*/
  private async gitProcess() {
    this.projectInfo.gitSetup = await this.git.events.emitEventAndReturn("gitIsInitialized", 5, this.projectInfo.workingkingDir);
    if (!this.projectInfo.gitSetup) {
      const setupGit = await confirm({
        message: "Do you want to setup git?",
      });
      if (setupGit) {
        const wasSetup = await this.git.events.emitEventAndReturn("gitInit", 5, this.projectInfo.workingkingDir);
        if (!wasSetup) {
          console.error("Failed to setup git - you can handle this manually.");
          return;
        }
        //await this.gitHubProcess();
      }
    }
  }

  private async npmProcess() {
    this.projectInfo.npmSetup = await this.npm.events.emitEventAndReturn("isNPMInitialized", 5, this.projectInfo.workingkingDir);
    if (!this.projectInfo.npmSetup) {
      const setupNPM = await confirm({
        message: "Do you want to init a new project?",
      });
      if (setupNPM) {
        const wasSetup = await this.npm.events.emitEventAndReturn("npmInit", 5, this.projectInfo.workingkingDir);
        if (!wasSetup) {
          console.error("Failed to setup npm - you can handle this manually.");
          return;
        }
      }
    }
  }

  public async run() {
    if (!await confirm({
      message: `Use ${this.projectInfo.workingkingDir} as the working directory?`,
      default: true,
    })) {
      this.projectInfo.workingkingDir = await input({
        message: "Enter the path",
        default: this.projectInfo.workingkingDir,
      });
      if (!existsSync(this.projectInfo.workingkingDir)) {
        console.error(`Path does not exist (${this.projectInfo.workingkingDir})`);
        return;
      }
    }
    
    await this.gitProcess();
    await this.npmProcess();

    // const answer = await input({message: "Enter your name"});
    // console.log(answer);
    console.log();
    console.log(await this.npm.events.emitEventAndReturn("isNPMInitialized", 5, process.cwd()));
  }
}
