declare module "@unbound/managers" {
		export type Author = {
				name: string;
				id: `${number}`;
		};

		export interface Manifest {
				id: string;
				name: string;
				description: string;
				authors: Author[];
				icon: (string & {}) | { uri: string; };
				updates: string;
				main: string;
				version: string;
				folder: string;
				path: string;
				url: string;
		}

		export interface Addon {
				started: boolean;
				instance: any;
				id: string;
				failed: boolean;
				data: Manifest;
		}

		export type Resolveable = string | Addon;
		export type Manager = keyof typeof Managers;
		export type Plugin = Addon & {
				instance: PluginInstance | null;
		};

		export interface PluginInstance {
				start?(): void;
				stop?(): void;
				getSettingsPanel?(): React.ReactNode;
		}

		export type Theme = Addon & {
				instance: {
						semantic: Record<PropertyKey, {
								type: 'color' | 'raw';
								value: string;
								opacity?: number;
						}>;
						raw: Record<PropertyKey, string>;
						type: 'midnight' | 'darker' | 'light';
						background?: {
								blur?: number;
								opacity?: number;
								url: string;
						};
				};
		};
		export type IconPackManifest = Pick<Manifest, 'id' | 'name' | 'description' | 'version' | 'updates'> & {
				type: 'github' | 'external';
		};
}

declare module "@unbound/metro" {
		import { Filter } from "@unbound/metro/filters";

		export function addListener(listener: (mdl: any, id: string) => void): () => boolean;

		export function removeListener(listener: (mdl: any, id: string) => void): void;

		export function findLazy(filter: Filter, options?: Omit<SearchOptions, "lazy" | "all">): any;

		export function find(filter: Filter, options?: SearchOptions): any;

		export function bulk(...items: BulkItem[]): any[];

		export function findByProps<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): PropertyRecordOrArray<T, U> & {};

		export function findByPrototypes<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): AnyProps<Record<string, any>>;

		export function findStore<U extends string, T extends U[] | StringFindWithOptions<U, StoreOptions>>(...args: T): AnyProps<Record<string, any>>;

		export function findByName<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): FunctionSignatureOrArray<T, U>;

		export function initializeModule(id: string): boolean;

		export const METRO_CACHE_KEY: typeof METRO_CACHE_KEY;
		export const data: { cache: {}; patchedNativeRequire: boolean; patchedRTNProfiler: boolean; origToString: () => string; listeners: Set<(mdl: any, id: string) => void>; };
		export const on: typeof addListener;
		export const off: typeof removeListener;

		export type InternalOptions = {
				bulk?: boolean;
				lazy?: boolean;
		};
		export type SearchOptions = {
				esModules?: boolean;
				interop?: boolean;
				initial?: any[];
				cache?: boolean;
				lazy?: boolean;
				raw?: boolean;
				all?: boolean;
				initialize?: boolean;
		};

		export interface StoreOptions extends SearchOptions {
				short?: boolean;
		}

		export interface BulkItem extends Omit<SearchOptions, 'initial' | 'cache'> {
				filter: Filter;
		}

		export type StringFindWithOptions<T extends string, Options = SearchOptions> = [...T[], Options];
		export type BulkFind<T extends string> = [...AnyProps<{ params: T[]; }>[], AnyProps<{ bulk: true; }>];
		export type AllValues<T extends Record<string, any>, U extends unknown> = T extends { all: true; } ? U[] : U;
		export type SingleModuleByProperty<T extends any[]> = T extends [...any, infer O extends SearchOptions]
				? AllValues<O, AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>>
				: AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>;
		export type SingleModuleByName<T extends any[]> = T extends [...any, infer O extends SearchOptions]
				? AllValues<O, O extends { interop: false; }
						? { default: Fn; }
						: Fn>
				: Fn;
		export type BulkModuleByProperty<T extends any[]> = {
				[K in keyof T]: AnyProps<{
						[P in T[K]['params'][number]]: any
				}>
		};
		export type BulkModuleByName<T extends any[]> = {
				[K in keyof T]: T[K] extends { interop: false; }
				? { default: Fn; }
				: Fn
		};
		export type PropertyRecordOrArray<T extends any[], U extends string> = T extends BulkFind<U>
				? BulkModuleByProperty<T>
				: SingleModuleByProperty<T>;
		export type FunctionSignatureOrArray<T extends any[], U extends string> = T extends BulkFind<U>
				? BulkModuleByName<T>
				: SingleModuleByName<T>;
		export type Module<TProps extends string> = PropertyRecordOrArray<TProps[], TProps>;
}

declare module "@unbound/utilities" {
		import { FileManagerEncoding } from "@unbound/fs";
    import { ColorValue, LayoutAnimationConfig } from "react-native";

		/**
		 * @description Traverses through a React node to find a specific item using a predicate, useful for searching children in node trees that might change as Discord gets updated.
		 * @template T The type of the result you expect. Please keep in mind that the value might be null, wrapping your type in Nullable<T> is advised.
		 * @param tree The React node to search through.
		 * @param predicate Predicate function to decide whether the current item in the search stack should be returned.
		 * @param options Search options for findInTree, see https://github.com/unbound-mod/client/blob/main/src/utilities/findInTree.ts for more information.
		 * @return The value found by the predicate if one is found.
		 */
		export function findInReactTree<T = any>(tree: JSX.Element, predicate: FindInTreePredicate, options?: Partial<FindInTreeOptions>): T;

		/**
		 * @description Removes opacity from a color. Note: This will convert the color to a hex.
		 * @param color The color to remove opacity from.
		 * @returns The color provided as a hex string without opacity.
		 */
		export function withoutOpacity(color: number | ColorValue): string;

		/**
		 * @description Allows you to fake render a component to get its return value. This also supports props.
		 * @param component The React function component to call. (Note: For class components, please use <Component>.prototype.render for this value)
		 * @param context The component you are passing might use the "this" keyword. This argument will be the value provided when "this" is used inside the component. (Optional)
		 * @returns A callable function to get the components return value using the props provided. (e.g. func({ count: 1 }))
		 */
		export function forceRender<T extends (...args: any[]) => JSX.Element>(component: T, context?: any): (...args: Parameters<T>) => (...args: any[]) => ReturnType<T>;

		/**
		 * @description Merges styles and filters out nullish values. Similar to the [clsx](https://www.npmjs.com/package/clsx) library.
		 * @param styles Nullable styling objects.
		 * @return The merged style object.
		 */
		export function mergeStyles(...styles: (boolean | Record<any, any>)[]): Record<any, any>;

		/**
		 * @description Splits an array into chunks of the specified size. Useful for concurrency.
		 * @template T The type of the items inside of the array.
		 * @param array The array instance to split into chunks.
		 * @param size The desired size of each chunk.
		 * @returns An array of arrays with a maximum item count of the desired size.
		 */
		export function chunkArray<T extends any>(array: T[], size: number): T[][];

		/**
		 * @description Capitalizes the first letter of a string.
		 * @param input The string to capitalize.
		 * @returns The capitalized string.
		 */
		export function capitalize(input: string): string;

		/**
		 * @description Traverses through a tree through provided walkables, aiming to find a specific item using a predicate.
		 * @template T The type of the result you expect. Please keep in mind that the value might be null, wrapping your type in Nullable<T> is advised.
		 * @param tree The tree to traverse.
		 * @param predicate Predicate function to decide whether the current item in the search stack should be returned.
		 * @param options The options for the search.
		 * @param options.ignore The keys to ignore during traversal.
		 * @param options.walkable The keys to walk/traverse in the search.
		 * @param options.maxProperties The maximum properties to traverse through before bailing.
		 * @return The value found by the predicate if one is found.
		 */
		export function findInTree<T = any>(tree: Record<any, any> | unknown[], predicate: FindInTreePredicate, options?: FindInTreeOptions): T;

		/**
		 * @description Turns a function into a worklet for use within React Native Reanimated runOnUI, runOnJS, and worklet runtime calls.
		 * - This is **VERY FRAGILE**. Expect crashes initially. You can view worklet errors by filtering logs containing "crash" in the syslog viewer of your choice (e.g. idevicesyslog)
		 * - This aims to be a replacement for the compile-time workletization React Native Reanimated's Babel plugin provides (https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/).
		 * - Any variable referenced inside of the function code MUST be added to the closure object and destructured inside of the function like so: `const { foo } = this.__closure`
		 * - Any functions inside of the closure object must also be workletized. Common functions like console.log already exist.
		 * - Ensure that all code inside of the worklet is compatible with [Hermes](https://github.com/facebook/hermes/blob/main/doc/Features.md) (our JS runtime)
		 * - Some globals may not be available. This consists of mostly React Native specific globals that are not part of the globals that Hermes provides out of the box (e.g. window.alert())
		 * - Hermes does not have .toString() compatibility as it executes from bytecode. Due to this, you have to pass the function code as a raw string argument (func.toString() will not work).
		 * - To check if the function is running on the UI thread, please use `if (_WORKLET)`
		 * @param instance The function instance you would like to workletize.
		 * @param code The string version of the function to eval on the worklet runtime (e.g. runOnUI or runOnJS)
		 * @param closure An object containing all variables referenced inside of the string version of the function. Please note: any referenced functions MUST be workletized.
		 * @returns The same function you passed, with worklet properties added to it.
		 */
		export function workletize(instance: Fn<any>, code: string, closure?: Record<string, any>): WorkletizedFunction;

		/**
		 * @description Maps a number from 0 to 1 into a 2-character hex string.
		 * @param number The number to parse into a hex string.
		 * @returns The converted hex values.
		 */
		export function unitToHex(number: number): string;

		/**
		 * @description Throttles a function by the provided milliseconds.
		 * @template T The function's type. Used to provide autocomplete for function arguments.
		 * @param func The function to debounce.
		 * @param ms The milliseconds to debounce the function by.
		 * @return An instance of the function wrapped in a debounce timer.
		 */
		export function debounce<T extends Fn>(func: T, ms: number): (...args: Parameters<T>) => void;

		/**
		 * @description Downloads a file to the specified path in the specified encoding (utf8 by default).
		 * @param url The URL of the file you would like to download.
		 * @param path The file path to save this file to, including the file name.
		 * @param encoding The encoding used when saving the file. (Default: utf8)
		 * @param signal An abort signal for the request. (Optional)
		 * @returns A promise with no valuable information.
		 */
		export function download(url: string, path: string, encoding?: FileManagerEncoding, signal?: AbortSignal): Promise<string>;

		/**
		 * @description Attempts calling a function and bails if it fails.
		 * @template T Your function's type. Used for inferring the return type.
		 * @param callback The function to attempt calling.
		 * @returns The function result or an Error instance.
		 */
		export function attempt<T extends Fn>(callback: T): ReturnType<T> | Error;

		/**
		 * @description Checks if an object is empty.
		 * @param object The object to check.
		 * @returns A boolean indicating whether the object is empty or not.
		 */
		export function isEmpty(object: Record<any, any>): boolean;

		/**
		 * @description Animates the provided callback using a layout animation.
		 * @template T Your function's type. Used for inferring function parameters and the return type.
		 * @param callback The callback that will trigger a UI update to animate.
		 * @param options The layout animation options. Se e [LayoutAnimationConfig](https://reactnative.dev/docs/layoutanimation#configurenext) for more information. (Optional)
		 * @returns Returns a callable function that configures a layout animation before running the provided callback, resulting in an animated UI update.
		 */
		export function animate<T extends Fn>(callback: T, options?: LayoutAnimationConfig): T;

		/** @description A function that does nothing. Useful for patching to avoid creating a function in memory for each patch. */
		export function noop(...args: any): any;

		/**
		 * @description Returns a UUID of the requested length. (default: 30)
		 * @param length The length of the randomized UUID.
		 * @return Returns a random UUID.
		 */
		export function uuid(length?: number): string;

		type FindInTreePredicate = (element: any) => boolean;

		interface FindInTreeOptions {
				ignore?: (string | symbol)[];
				walkable?: (string | symbol)[];
				maxProperties?: number;
		}

		interface WorkletizedFunction extends Fn {
				__closure: Record<PropertyKey, any>;
				__workletHash: number;
				__initData: {
						code: string;
				};
		}
}

declare module "@unbound/commands" {
		export function registerCommands(caller: string, cmds: Omit<ApplicationCommand, "__CALLER__" | "__UNBOUND__">[]): void;

		export function unregisterCommands(caller: string): void;

		export enum ApplicationCommandType {
				CHAT = 1,
				USER,
				MESSAGE
		}

		export enum ApplicationCommandInputType {
				BUILT_IN,
				BUILT_IN_TEXT,
				BUILT_IN_INTEGRATION,
				BOT,
				PLACEHOLDER
		}

		export enum ApplicationCommandOptionType {
				SUB_COMMAND = 1,
				SUB_COMMAND_GROUP,
				STRING = 3,
				INTEGER,
				BOOLEAN,
				USER,
				CHANNEL,
				ROLE,
				MENTIONABLE,
				NUMBER,
				ATTACHMENT
		}

		export const data: { commands: any[]; };

		export interface ApplicationCommand {
				name: string;
				displayName?: string;
				description: string;
				displayDescription?: string;
				inputType?: ApplicationCommandInputType;
				type?: ApplicationCommandType;
				applicationId?: string;
				__UNBOUND__?: boolean;
				__CALLER__?: string;
				id?: string;
				options?: ApplicationCommandOption[];
				execute: (args: any[], ctx: CommandContext) => CommandResult | void | Promise<CommandResult> | Promise<void>;
		}

		export interface ApplicationCommandOption {
				name: string;
				description: string;
				required?: boolean;
				type: ApplicationCommandOptionType;
				displayName: string;
				displayDescription: string;
		}

		interface CommandContext {
				channel: any;
				guild: any;
		}

		interface CommandResult {
				content: string;
				tts?: boolean;
		}
}

declare module "@unbound/settings" {
		import { ImageSourcePropType } from "react-native";

		export function registerSettings(...sections: SectionType[]): void;

		export const settings: any[];

		export interface SectionType {
				label: string;
				entries: AnyProps<{
						title: string;
						id: string;
						icon?: ImageSourcePropType;
						keywords?: string[];
						screen: (...args) => JSX.Element;
						mappable?: boolean;
				}>[];
		}
}

declare module "@unbound/patcher" {
		export function before<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: BeforeCallback<M[P]>, once?: boolean): () => void;

		export function instead<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: InsteadCallback<M[P]>, once?: boolean): () => void;

		export function after<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: AfterCallback<M[P]>, once?: boolean): () => void;

		export function createPatcher(name: string): { getPatchesByCaller: typeof getPatchesByCaller; unpatchAll: () => void; before<M extends Record<P, Fn>, P extends PropOf<M>>(mdl: M, func: P, callback: BeforeCallback<M[P]>, once?: boolean): () => void; after<M extends Record<P, Fn>, P extends PropOf<M>>(mdl: M, func: P, callback: AfterCallback<M[P]>, once?: boolean): () => void; instead<M extends Record<P, Fn>, P extends PropOf<M>>(mdl: M, func: P, callback: InsteadCallback<M[P]>, once?: boolean): () => void; };

		export function getPatchesByCaller(id?: string): Patch[];

		export function unpatchAll(caller?: string): void;

		export enum PatchType {
				Before = 'before',
				Instead = 'instead',
				After = 'after'
		}

		export const patches: PatchOverwrite[];

		export type BeforeCallback<F extends Fn> = (context?: any, args?: Parameters<F>, original?: F, unpatch?: () => void) => Parameters<F> | void;
		export type InsteadCallback<F extends Fn> = (context?: any, args?: Parameters<F>, original?: F, unpatch?: () => void) => ReturnType<F> | void;
		export type AfterCallback<F extends Fn> = (context?: any, args?: Parameters<F>, result?: ReturnType<F>, unpatch?: () => void) => ReturnType<F> | void;

		export interface PatchOverwrite {
				mdl: Record<string, any> | Function;
				func: string;
				original: Function;
				unpatch: () => void;
				patches: {
						before: Patch[];
						after: Patch[];
						instead: Patch[];
				};
		}

		export interface Patch {
				caller: string;
				once: boolean;
				type: PatchType;
				id: number;
				callback: any;
				unpatch: () => void;
		}
}

declare module "@unbound/storage" {
		export function get<T extends any>(store: string, key: string, def: T): T & {};

		export function set(store: string, key: string, value: any): void;

		export function toggle(store: string, key: string, def: any): void;

		export function remove(store: string, key: string): void;

		export function clear(store: string): void;

		export function getStore(store: string): { set: (key: string, value: any) => void; get: <T extends unknown>(key: string, def: T) => T & {}; toggle: (key: string, def: any) => void; remove: (key: string) => void; clear: () => void; useSettingsStore: (predicate?: (payload: SettingsPayload) => boolean) => { set: (key: string, value: any) => void; get: <T = any>(key: string, def: NoInfer<T>) => T; toggle: (key: string, def: any) => void; remove: (key: string) => void; }; };

		export function useSettingsStore(store: string, predicate?: (payload: SettingsPayload) => boolean): { set: (key: string, value: any) => void; get: <T = any>(key: string, def: NoInfer<T>) => T; toggle: (key: string, def: any) => void; remove: (key: string) => void; };

		export const settings: any;
		export const data: { isPendingReload: boolean; };
		export const on: any;
		export const off: any;

		export interface SettingsPayload {
				store: string;
				key: string;
				value: any;
		}
}

declare module "@unbound/dialogs" {
		import { ReactElement } from "react";

		export function showDialog(options: AlertProps): void;

		interface AlertProps {
				/**
				 * Key of the alert
				 * @default : uuid()
				 */
				key?: string;
				/**
				 * Title of the alert.
				 * @required
				 */
				title: string;
				/**
				 * Content in the alert.
				 * Can partially be a React Component however some things don't render.
				 * @optional
				 */
				content?: ReactElement;
				/**
				 * Extra content which renders in the `actions` prop above the button.
				 * If there is no `content` prop passed then this is rendered with no margin.
				 * @optional
				 */
				component?: ReactElement;
				/**
				 * Adds some extra margins to the custom component to be rendered.
				 * @default : true
				 */
				componentMargin?: boolean;
				/**
				 * Array of buttons that should be rendered under the content of the alert.
				 * @optional
				 */
				buttons?: {
						text: string;
						onPress?: Fn;
						variant?: string;
						/**
						 * Whether the button should close the alert when pressed.
						 * @default: true
						 */
						closeAlert?: boolean;
				}[];
				/**
				 * Whether to automatically add a `cancel` button.
				 * @default : true
				 */
				cancelButton?: boolean;
				/**
				 * Optional callback for the press of the `cancel` button
				 */
				onCancel?: Fn;
		}
}

declare module "@unbound/assets" {
		export function find(filter: any): Asset;

		export function getByName(name: string, type?: "svg" | "png"): Asset;

		export function getByID(id: number): Asset;

		export function getIDByName(name: string, type?: "svg" | "png"): number;

		export function getAll(): Asset[];

		export const assets: Map<number, Asset>;
		export const Icons: Record<any, any>;

		export interface Asset {
				__packager_asset?: boolean;
				/**
				 * Name of the asset.
				 */
				name: string;
				/**
				 * Location of the asset in the local assets directory.
				 */
				httpServerLocation?: string;
				/**
				 * Full icon path used for overwriting icons with icon packs.
				 */
				iconPackPath?: string;
				/**
				 * Scale decided by finding the largest scale of an asset which is defined in an icon pack.
				 */
				iconPackScale?: number;
				/**
				 * Width of the asset.
				 */
				width: number;
				/**
				 * Height of the asset.
				 */
				height: number;
				/**
				 * Scales that the asset is available in. For example: [1, 2] means that the asset is available in 1x and 2x sizes.
				 */
				scales: number[];
				/**
				 * Hash of the asset.
				 */
				hash: string;
				/**
				 * File extension of the asset.
				 */
				type: string;
		}
}

declare module "@unbound/toasts" {
		import { ImageSourcePropType } from "react-native";

		export function showToast(options: ToastOptions): { update(newOptions: Nullable<ToastOptions>): void; close(): void; };

		export interface ToastButton {
				color?: ButtonColors[keyof ButtonColors];
				variant?: ButtonLooks[keyof ButtonLooks] | 'primary' | 'secondary' | 'tertiary';
				size?: ButtonSizes[keyof ButtonSizes] | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
				iconPosition?: 'start' | 'end';
				content: string;
				icon?: number;
				onPress: Fn;
		}

		export type ToastOptions = _ToastOptions | PartialBy<_ToastOptions, 'title'> | PartialBy<_ToastOptions, 'content'>;

		interface _ToastOptions {
				title: string | React.ComponentType;
				content: string;
				duration?: number;
				onTimeout?: Fn;
				icon?: string | number | ImageSourcePropType;
				id?: any;
				buttons?: ToastButton[];
				tintedIcon?: boolean;
		}

		interface ButtonColors {
				BRAND: 'brand';
				RED: 'red';
				GREEN: 'green';
				PRIMARY: 'primary';
				TRANSPARENT: 'transparent';
				GREY: 'grey';
				LIGHTGREY: 'lightgrey';
				WHITE: 'white';
				LINK: 'link';
		}

		interface ButtonLooks {
				FILLED: 'filled';
				LINK: 'link';
				OUTLINED: 'outlined';
		}

		interface ButtonSizes {
				XSMALL: 'xsmall';
				SMALL: 'small';
				MEDIUM: 'medium';
				LARGE: 'large';
		}
}

declare module "@unbound/native" {
		export function reload(instant?: boolean): Promise<void>;

		export function getNativeModule(...names: string[]): any;

		export const BundleInfo: BundleInfoType;
		export const BundleManager: BundleManagerType;
		export const DeviceInfo: DeviceInfoType;

		export interface BundleInfoType {
				Version: string;
				ReleaseChannel: string;
				Manifest: string;
				Build: string;
				SentryDsn: string;
				DeviceVendorID: string;
				OTABuild: string;
				SentryStaffDsn: string;
				Identifier: string;
				SentryAlphaBetaDsn: string;
		}

		export interface DeviceInfoType {
				isTaskBarEnabled: boolean;
				maxCpuFreq: string;
				socName: string;
				deviceModel: string;
				isTablet: boolean;
				isGestureNavigationEnabled: boolean;
				deviceProduct: string;
				systemVersion: string;
				deviceManufacturer: string;
				deviceBrand: string;
				ramSize: string;
				device: string;
		}

		export interface BundleManagerType {
				getInitialBundleDownloaded: PromiseFn;
				getInitialOtaUpdateChecked: PromiseFn;
				checkForUpdateAndReload: Fn;
				reload: Fn;
				getOtaRootPath: PromiseFn;
				getBuildOverrideCookieContents: PromiseFn;
				setBuildOverrideCookieHeader: PromiseFn;
				getManifestInfo: PromiseFn;
				addListener: Fn;
				removeListeners: Fn;
		}
}

declare module "@unbound/i18n" {
		export function add(strings: LocaleStrings): { remove: () => void; };

		export const state: { locale: string; messages: {}; };
		export const Strings: any;

		export type LocaleStrings = Record<string, Record<string, any>>;
}

declare module "@unbound/fs" {
		export function read(path: string, encoding?: FileManagerEncoding, inDocuments?: boolean): Promise<string>;

		export function write(path: string, content: string, encoding?: FileManagerEncoding): Promise<string>;

		export function rm(path: string): Promise<boolean>;

		export function exists(path: string, inDocuments?: boolean): Promise<boolean>;

		export const Documents: string;

		export type FileManagerEncoding = 'utf-8' | 'utf8' | 'base64';

		export interface FileManagerConstants {
				CacheDirPath: string;
				DocumentsDirPath: string;
		}

		export interface FileManagerType extends FileManagerConstants {
				CacheDirPath: string;
				DocumentsDirPath: string;
				readFile(path: string, encoding: FileManagerEncoding): Promise<string>;
				writeFile(type: 'documents' | 'cache', path: string, data: string, encoding: FileManagerEncoding): Promise<string>;
				removeFile(type: 'documents' | 'cache', path: string): Promise<any>;
				readAsset(): Promise<unknown>;
				getSize(): Promise<unknown>;
				getVideoDimensions(): Promise<unknown>;
				fileExists(path: string): Promise<boolean>;
				saveFileToGallery(): Promise<unknown>;
				getConstants(): FileManagerConstants;
		}
}

declare module "@unbound/metro/components" {
		export const BackdropFilters: { BackgroundBlurFill: any; } & Record<PropertyKey, any>;
		export const Design: { RowButton: any; dismissAlerts: any; ContextMenu: any; } & Record<PropertyKey, any>;
		export const Portal: { PortalHost: any; Portal: any; } & Record<PropertyKey, any>;
		export const Slider: any;
		export const Media: { openMediaModal: any; } & Record<PropertyKey, any>;
		export const HelpMessage: Fn<any>;
		export const Forms: { FormSliderRow: any; } & Record<PropertyKey, any>;
}

declare module "@unbound/metro/filters" {
		export function byProps(...props: string[]): Filter;

		export function byPrototypes(...prototypes: string[]): Filter;

		export function byDisplayName(name: string): Filter;

		export function byName(name: string): Filter;

		export function byStore(name: string, short?: boolean): Filter;

		export type Filter = ((mdl: any, id: number | string) => boolean | never);
}

declare module "@unbound/metro/common" {
		import { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";

		export const ReactNative: typeof import("C:/Users/eternal/Documents/Projects/TypeScript/unbound-client/node_modules/react-native/types/index");
		export const React: typeof globalThis.React;
		export const Reanimated: typeof import("C:/Users/eternal/Documents/Projects/TypeScript/unbound-client/node_modules/react-native-reanimated/lib/typescript/index");
		export const Gestures: typeof import("C:/Users/eternal/Documents/Projects/TypeScript/unbound-client/node_modules/react-native-gesture-handler/lib/typescript/index");
		export const Clipboard: { getString(): Promise<string>; getStrings(): Promise<string[]>; getImagePNG(): Promise<string>; getImageJPG(): Promise<string>; setImage(content: string): void; getImage(): Promise<string>; setString(content: string): void; setStrings(content: string[]): void; hasString(): Promise<boolean>; hasImage(): Promise<boolean>; hasURL(): Promise<boolean> | undefined; hasNumber(): Promise<boolean> | undefined; hasWebURL(): Promise<boolean> | undefined; addListener(callback: () => void): import("C:/Users/eternal/Documents/Projects/TypeScript/unbound-client/node_modules/react-native/types/index").EmitterSubscription; removeAllListeners(): void; };
		export const Flux: Common.Flux;
		export const Moment: typeof import("C:/Users/eternal/Documents/Projects/TypeScript/unbound-client/node_modules/moment/ts3.1-typings/moment");
		export const Screens: { FullWindowOverlay: any; } & Record<PropertyKey, any>;
		export const Assets: { registerAsset: any; } & Record<PropertyKey, any>;
		export const SVG: { Svg: any; Path: any; } & Record<PropertyKey, any>;
		export const StyleSheet: Common.StyleSheet;
		export const Dispatcher: { _dispatch: any; } & Record<PropertyKey, any>;
		export const Constants: { Fonts: any; Endpoints: any; } & Record<PropertyKey, any>;
		export const Theme: { colors: any; internal: any; } & Record<PropertyKey, any>;
		export const REST: { getAPIBaseURL: any; } & Record<PropertyKey, any>;
		export const i18n: { Messages: any; _requestedLocale: any; } & Record<PropertyKey, any>;

		export type Events = typeof import('events');

		interface Flux {
				Store: (new (dispatcher: Dispatcher, listeners: Record<string, ({ [key: string]: any; })>) => any);
				connectStores: Fn;
		}

		interface Dispatcher {
				dispatch(payload: Record<string, any>): Promise<void>;
				unsubscribe(event: string, handler: Fn): void;
				subscribe(event: string, handler: Fn): void;
		}

		interface Flux {
				Store: (new (dispatcher: Dispatcher, listeners: Record<string, ({ [key: string]: any; })>) => any);
				connectStores: Fn;
		}

		interface StyleSheet {
				createStyles: <T extends Record<string, StyleProp<ViewStyle | TextStyle | ImageStyle>>>(style: T) => Fn<T>;
		}
}

declare module "@unbound/metro/stores" {
		export const Theme: AnyProps<Record<string, any>>;
		export const Users: AnyProps<Record<string, any>>;
}

declare module "@unbound/metro/api" {
		export const Linking: { openURL: any; openDeeplink: any; } & Record<PropertyKey, any>;
		export const Profiles: { showUserProfile: any; } & Record<PropertyKey, any>;
		export const AsyncUsers: { fetchProfile: any; } & Record<PropertyKey, any>;
}

declare module "@unbound" {
		export * as default from "@unbound";
    export * as assets from "@unbound/assets";
    export * as commands from "@unbound/commands";
    export * as dialogs from "@unbound/dialogs";
    export * as fs from "@unbound/fs";
    export * as i18n from "@unbound/i18n";
    export * as managers from "@unbound/managers";
    export * as metro from "@unbound/metro";
    export * as native from "@unbound/native";
    export * as patcher from "@unbound/patcher";
    export * as settings from "@unbound/settings";
    export * as storage from "@unbound/storage";
    export * as toasts from "@unbound/toasts";
    export * as utilities from "@unbound/utilities";
}
