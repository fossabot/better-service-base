import { ILogger, PluginFeature } from "./ILib";

export class DefaultLogger implements ILogger {
  init (features: PluginFeature): ILogger {
    return this;
  }
  debug (plugin: string, ...data: any[]): void {
    if (typeof data === 'string')
      return console.debug(`[DEBUG][${plugin.toUpperCase()}] ${data}`);
    console.debug(`[DEBUG][${plugin.toUpperCase()}]`, data);
  }
  info (plugin: string, ...data: any[]): void {
    if (typeof data === 'string')
      return console.log(`[${plugin.toUpperCase()}] ${data}`);
    console.log(`[${plugin.toUpperCase()}]`, data);
  }
  warn (plugin: string, ...data: any[]): void {
    if (typeof data === 'string')
      return console.warn(`[${plugin.toUpperCase()}] ${data}`);
    console.warn(`[${plugin.toUpperCase()}]`, data);
  }
  error (plugin: string, ...data: any[]): void {
    if (typeof data === 'string')
      return console.error(`[${plugin.toUpperCase()}] ${data}`);
    console.error(`[${plugin.toUpperCase()}]`, data);
  }
}