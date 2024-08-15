// THIS FILE IS SUBJECT TO COPYRIGHT FROM THE SOURCE - https://github.com/BetterCorp/Node-Tools.git 
// @bettercorp/tools

export interface MergeObjectsKey {
  refPropName: string;
  refPropKey: string;
}

export interface SimpleStatu<T = any> {
  status: boolean;
  value?: T;
}

/**
 * @hidden
 */
export type DynamicallyReferencedType = Record<string, Function>;
/**
 * @hidden
 */
export type DynamicallyReferencedMethodBase = DynamicallyReferencedType;
/**
 * @hidden
 */
export type DynamicallyReferencedMethodType<T> = T & DynamicallyReferencedMethodBase;


// from: https://stackoverflow.com/a/73394054/8083582
export type ParamsFromString<T extends string> =
// Check if this string includes a param, and infer the param name,
// as well as the string before and after
    T extends `${infer Pre}{${infer Param}}${infer Post}`
    ? // A param exists in the string, so return it as a union type that
        // includes all other params in the string with this param removed.
    Param | ParamsFromString<`${Pre}${Post}`>
    : // No params exist in these string, so return never.
    never;

export type DynamicallyReferencedMethod<
    Interface extends DynamicallyReferencedType,
    Method extends string,
    ArgsReference extends boolean = true
> = ArgsReference extends true
    ? // If this DRM was called via the arguments of the method, then we return the args array
    Interface[Method] extends (...a: infer Arguments) => infer Return
    ? // If the method actually exists, we return the original argument (method) plus all additional arguments
    [method: Method, ...a: Arguments]
    : // No method is known, so we just define the default argument (method) and an argument that will never be valid to cause typescript to error
    [method: Method, noMatchingMethod: never]
    : // For the return properties we do the same method check
    Interface[Method] extends (...a: infer Arguments) => infer Return
    ? // If the method exists, we return the methods return information
    Return
    : // Else we return a never as it doesn't exist
    never;

export enum CleanStringStrength {
  soft   = "soft",
  hard   = "hard",
  exhard = "exhard",
  url    = "url",
  ip     = "ip",
  email  = "email",
  custom = "custom"
}
