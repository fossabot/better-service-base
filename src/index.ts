import * as EVENT_EMITTER from 'events';
import * as FS from 'fs';
import * as PATH from 'path';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IDictionary } from '@bettercorp/tools/lib/Interfaces';
import { IEmitter, ILOGGER, IPlugin, ServiceConfig, ServiceConfigPlugins } from "./ILib";
import { v4 as UUID } from 'uuid';

const CWD = process.env.APP_DIR || process.cwd();
const PACKAGE_JSON = PATH.join(CWD, './package.json');
const _version = JSON.parse(FS.readFileSync(PACKAGE_JSON).toString()).version;
let _runningInDebug = true;

const appConfig = JSON.parse(process.env.CONFIG_OBJECT || FS.readFileSync(process.env.CONFIG_FILE || PATH.join(CWD, "./sec.config.json")).toString()) as ServiceConfig;

if (!Tools.isNullOrUndefined(appConfig.debug)) {
  _runningInDebug = appConfig.debug;
}
if (process.env.FORCE_DEBUG !== undefined && process.env.FORCE_DEBUG !== null && process.env.FORCE_DEBUG == '1') {
  _runningInDebug = true;
}

appConfig.debug = _runningInDebug;
let pluginsDir = PATH.join(CWD, 'src');
if (!FS.existsSync(pluginsDir) || !FS.statSync(pluginsDir).isDirectory()) {
  pluginsDir = PATH.join(CWD, 'lib');
}

pluginsDir = PATH.join(pluginsDir, './plugins');
const LIBRARY_PLUGINS: IDictionary<IPlugin> = {};
const INTERNAL_EVENTS = new (EVENT_EMITTER as any)();

const CORE_PLUGINS = ['logging'];

let loggerPlugin: string | null = PATH.join(pluginsDir, `./${CORE_PLUGINS[0]}/plugin`);
if (FS.existsSync(`${loggerPlugin}.ts`)) {
  loggerPlugin = `${loggerPlugin}.ts`;
} else if (FS.existsSync(`${loggerPlugin}.js`)) {
  loggerPlugin = `${loggerPlugin}.js`;
} else {
  loggerPlugin = null;
}

const cnull = () => { };

let logger: ILOGGER = {
  debug: (pluginName: string, ...data: any[]) => _runningInDebug ? (
    typeof data === 'string'
      ? console.log(`[DEBUG][${pluginName.toUpperCase()}] ${data}`)
      : console.log(`[DEBUG] ${pluginName.toUpperCase()}`, data)) :
    cnull(),
  info: (pluginName: string, ...data: any[]) => typeof data === 'string'
    ? console.log(`[${pluginName.toUpperCase()}] ${data}`)
    : console.log(pluginName.toUpperCase(), data),
  error: (pluginName: string, ...data: any[]) => typeof data === 'string'
    ? console.error(`[${pluginName.toUpperCase()}] ${data}`)
    : console.error(pluginName.toUpperCase(), data),
  warn: (pluginName: string, ...data: any[]) => typeof data === 'string'
    ? console.warn(`[${pluginName.toUpperCase()}] ${data}`)
    : console.warn(pluginName.toUpperCase(), data)
};
if (!Tools.isNullOrUndefined(loggerPlugin)) {
  logger = require(loggerPlugin!).default;
}

logger.info(' - BOOT UP: @' + _version);

const SETUP_PLUGINS = () => new Promise(async (resolve) => {
  for (let pluginName of Object.keys(LIBRARY_PLUGINS)) {
    let plugin = LIBRARY_PLUGINS[pluginName];
    logger.info(`Setup Plugin: ${pluginName}`);
    if (plugin.init) {
      logger.info(` - INIT`);
      plugin.init({
        pluginName,
        log: {
          debug: (...data: any[]) => !Tools.isNullOrUndefined(plugin.log)
            ? plugin.log!.info(pluginName, data)
            : logger.info(pluginName, data),
          info: (...data: any[]) => !Tools.isNullOrUndefined(plugin.log)
            ? plugin.log!.info(pluginName, data)
            : logger.info(pluginName, data),
          error: (...data: any[]) => !Tools.isNullOrUndefined(plugin.log)
            ? plugin.log!.error(pluginName, data)
            : logger.error(pluginName, data),
          warn: (...data: any[]) => !Tools.isNullOrUndefined(plugin.log)
            ? plugin.log!.warn(pluginName, data)
            : logger.warn(pluginName, data)
        },
        cwd: CWD,
        events: INTERNAL_EVENTS,
        config: appConfig,
        getPluginConfig: <T = ServiceConfigPlugins> (): T => appConfig.plugins[pluginName] as T,
        onEvent: <T = any> (event: string, global: Boolean = false, listener: (data: IEmitter<T>) => void) => {
          logger.info(` - LISTEN: [${global ? event : `${pluginName}-${event}`}]`);
          INTERNAL_EVENTS.on(global ? event : `${pluginName}-${event}`, listener);
        },
        emitEvent: <T = any> (event: string, global: boolean = false, data?: T) => {
          INTERNAL_EVENTS.emit(global ? event : `${pluginName}-${event}`, data);
        },
        emitEventAndReturn: <T1 = any, T2 = any> (event: string, endpointOrPluginName: string, data?: T1) => new Promise((resolve, reject) => {
          const resultKey = UUID();
          const endEventName = `${endpointOrPluginName}-${event}-result-${resultKey}`;
          const errEventName = `${endpointOrPluginName}-${event}-error-${resultKey}`;

          let timeoutTimer = setTimeout(() => {
            if (timeoutTimer === null) return;
            INTERNAL_EVENTS.removeListener(endEventName, () => { });
            INTERNAL_EVENTS.removeListener(errEventName, () => { });
            reject(`NO RESPONSE IN TIME: ${endEventName} x${((data || {}) as any).timeoutSeconds || 10}s`);
          }, (((data || {}) as any).timeoutSeconds || 10) * 1000);
          INTERNAL_EVENTS.once(errEventName, (data: Error | string | any) => {
            clearTimeout(timeoutTimer);
            INTERNAL_EVENTS.removeListener(endEventName, () => { });
            INTERNAL_EVENTS.removeListener(errEventName, () => { });
            reject(data);
          });
          INTERNAL_EVENTS.once(endEventName, (data: T2 | any) => {
            clearTimeout(timeoutTimer);
            INTERNAL_EVENTS.removeListener(endEventName, () => { });
            INTERNAL_EVENTS.removeListener(errEventName, () => { });
            resolve(data);
          });
          INTERNAL_EVENTS.emit(`${endpointOrPluginName}-${event}`, {
            resultKey: resultKey,
            resultNames: {
              success: endEventName,
              error: errEventName
            },
            data: data
          });
        })
      });
    }
    logger.info(' - DONE');
  }
  resolve();
});

const packageJSONPluginsObjName = 'bettercorp-service-base';
let packageJSON = JSON.parse(FS.readFileSync(PACKAGE_JSON).toString());
let packageChanges = false;

if (Tools.isNullOrUndefined(packageJSON[packageJSONPluginsObjName])) {
  packageJSON[packageJSONPluginsObjName] = {};
  packageChanges = true;
}

const loadPlugin = (name: string, path: string) => {
  if (Tools.isNullOrUndefined(packageJSON[packageJSONPluginsObjName][name])) {
    packageJSON[packageJSONPluginsObjName][name] = true;
    packageChanges = true;
  } else {
    if (packageJSON[packageJSONPluginsObjName][name] == false) {
      logger.info(` - IGNORE PLUGIN [${name}] - defined in package.json`);
      return;
    }
  }

  if (!Tools.isNullOrUndefined(LIBRARY_PLUGINS[name])) {
    throw new Error(`Cannot have 2 plugins with the same name!! [${name}]`);
  }

  let importedPlugin = require(path);
  logger.info(` - ${name}: LOADED`);
  LIBRARY_PLUGINS[name] = importedPlugin;
};
const loadPlugins = (path: string): void => {
  logger.info(`Load plugins in: ${path}`);
  for (let dirFileWhat of FS.readdirSync(path)) {
    if (FS.statSync(PATH.join(path, dirFileWhat)).isDirectory()) {
      if (dirFileWhat.indexOf('-') === 0) {
        logger.info(` - IGNORE [${dirFileWhat}]`);
        continue;
      }
      if (CORE_PLUGINS.indexOf(dirFileWhat) > 0) {
        logger.info(` - IGNORE CORE PLUGIN [${dirFileWhat}]`);
        continue;
      }
      let pluginFile = PATH.join(path, dirFileWhat, 'plugin.ts');
      if (!FS.existsSync(pluginFile))
        pluginFile = PATH.join(path, dirFileWhat, 'plugin.js');
      if (!FS.existsSync(pluginFile))
        continue;

      loadPlugin(dirFileWhat, pluginFile);
    }
  }
};

export default class ServiceBase {
  init (): void {

    const npmPluginsDir = PATH.join(CWD, './node_modules/@bettercorp');
    logger.info(`Load NPM plugins in: ${npmPluginsDir}`);
    for (let dirFileWhat of FS.readdirSync(npmPluginsDir)) {
      if (FS.statSync(PATH.join(npmPluginsDir, dirFileWhat)).isDirectory()) {
        if (dirFileWhat.indexOf('service-base') != 0) {
          logger.info(` - IGNORE [${dirFileWhat}]`);
          continue;
        }
        const innerPluginLib = PATH.join(npmPluginsDir, dirFileWhat, './lib');
        if (!FS.existsSync(innerPluginLib) || !FS.statSync(innerPluginLib).isDirectory()) {
          logger.info(` - IGNORE [${dirFileWhat}]`);
          continue;
        }
        const innerPluginLibPlugin = PATH.join(innerPluginLib, './plugins');
        if (!FS.existsSync(innerPluginLibPlugin)) {
          let pluginFile = PATH.join(innerPluginLib, 'plugin.ts');
          if (!FS.existsSync(pluginFile))
            pluginFile = PATH.join(innerPluginLib, 'plugin.js');
          if (!FS.existsSync(pluginFile)) {
            logger.info(` - IGNORE [${dirFileWhat}]`);
            continue;
          }

          loadPlugin(dirFileWhat.replace('service-base-', ''), pluginFile);
          continue;
        }
        if (!FS.statSync(innerPluginLibPlugin).isDirectory()) {
          logger.info(` - IGNORE [${dirFileWhat}]`);
          continue;
        }

        loadPlugins(innerPluginLibPlugin);
      }
    }

    logger.info(`Load app plugins in: ${pluginsDir}`);
    loadPlugins(pluginsDir);

    if (packageChanges) {
      FS.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJSON));
    }
  }

  async run (): Promise<void> {
    logger.info('Setup plugins');
    await SETUP_PLUGINS();

    logger.info('App Ready');
  }
}