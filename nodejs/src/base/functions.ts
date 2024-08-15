import {BSBError} from "./errorMessages";

type SmartFunctionCallFunc = {
  [Symbol.toStringTag]?: string;
  (...args: any[]): any;
};

/**
 * initializes a function call and calls it with context but shows as the function type (async/sync)
 * @group Functions
 * @category Tools
 * @param context - the context to call the function with
 * @param input - the function to call
 * @param params - the parameters to pass to the function
 * @returns Async/Sync called function return type or immediately if the input is not a function
 * @throws BSBError context is not an object
 *
 * @example
 * ```ts
 * const myFunc = async (a: string, b: number) => {
 *   console.log("called with " + a + " and " + b);
 * };
 * console.log("done with " + (await SmartFunctionCallThroughAsync(this, myFunc, "a", 5)));
 * ```
 * @example
 * ```ts
 * const myFunc = (a: string, b: number) => {
 *   console.log("called with " + a + " and " + b);
 * };
 * console.log("done with " + SmartFunctionCallThroughAsync(this, myFunc, "a", 5));
 * ```
 */
export function SmartFunctionCallThroughAsync<T extends SmartFunctionCallFunc>(
    context: any,
    input: T | undefined,
    ...params: Parameters<T>
): Promise<ReturnType<T> | void> | ReturnType<T> | void {
  if (typeof input !== "function") {
    return;
  }
  if (typeof context !== "object") {
    throw new BSBError(
        "SmartFunctionCallThroughAsync: context is not an object",
    );
  }
  return input.call(context, ...params);
}

/**
 * Initializes a function call and calls it with context but shows as the function type (async)
 * @group Functions
 * @category Tools
 * @param context - the context to call the function with
 * @param input - the function to call
 * @param params - the parameters to pass to the function
 * @returns Async called function return type or immediately if the input is not a function
 * @throws BSBError context is not an object
 *
 * @example
 * ```ts
 * const myFunc = async (a: string, b: number) => {
 *   console.log("called with " + a + " and " + b);
 * };
 * console.log("done with " + await SmartFunctionCallAsync(this, myFunc, "a", 5));
 * ```
 */
export async function SmartFunctionCallAsync<T extends SmartFunctionCallFunc>(
    context: any,
    input: T | undefined,
    ...params: Parameters<T>
): Promise<ReturnType<T> | void> {
  if (typeof input !== "function") {
    return;
  }
  if (typeof context !== "object") {
    throw new BSBError(
        "SmartFunctionCallAsync: context is not an object",
    );
  }
  if (input[Symbol.toStringTag] === "AsyncFunction") {
    return await input.call(context, ...params);
  }
  return input.call(context, ...params);
}

/**
 * initializes a function call and calls it with context but shows as the function type (sync)
 * @group Functions
 * @category Tools
 * @param context
 * @param input
 * @param params
 * @constructor
 */
export function SmartFunctionCallSync<T extends SmartFunctionCallFunc>(
    context: any,
    input: T | undefined,
    ...params: Parameters<T>
): ReturnType<T> | void {
  if (typeof input !== "function") {
    return;
  }
  if (typeof context !== "object") {
    throw new BSBError(
        "SmartFunctionCallSync: context is not an object",
    );
  }
  return input.call(context, ...params);
}
