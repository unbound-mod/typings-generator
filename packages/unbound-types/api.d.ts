declare module '@unbound/assets' {
    export function find(filter: any): Asset;

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
        /**
         * ID of the asset.
         */
        id: number;
    }

    export function getByName(name: string, type?: "svg" | "png"): Asset;

    export function getByID(id: number): Asset;

    export function getIDByName(name: string, type?: "svg" | "png"): number;

    export function getAll(): Asset[];

    export const assets: Set<Asset>;
    export const registry: AnyProps<{ registerAsset: any; }>;
    export const Icons: Record<any, any>;
}

declare module '@unbound/commands' {
    export function registerCommands(caller: string, cmds: ApplicationCommand[]): void;

    export interface ApplicationCommand {
        name: string;
        displayName?: string;
        description: string;
        displayDescription?: string;
        inputType?: ApplicationCommandInputType;
        type?: ApplicationCommandType;
        applicationId?: string;
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

    export const data: { commands: any[]; section: { id: string; type: number; name: string; icon: string; }; };
}

declare module '@unbound/components' {
    import type { ViewStyle, TextInputProps } from "react-native";

    export function CodeBlock(options: CodeblockProps): React.JSX.Element;

    interface CodeblockProps {
        selectable?: boolean;
        children: string;
        style?: any;
    }

    type SectionProps = {
        title?: string;
        children?: React.ReactNode,
        style?: ViewStyle;
        margin?: boolean;
    };
    export type Module<TProps extends string> = PropertyRecordOrArray<TProps[], TProps>;
    export type PropertyRecordOrArray<T extends any[], U extends string> = T extends BulkFind<U>
        ? BulkModuleByProperty<T>
        : SingleModuleByProperty<T>;
    export type BulkFind<T extends string> = [...AnyProps<{ params: T[]; }>[], AnyProps<{ bulk: true; }>];
    export type BulkModuleByProperty<T extends any[]> = {
        [K in keyof T]: AnyProps<{
            [P in T[K]['params'][number]]: any
        }>
    };
    export type SingleModuleByProperty<T extends any[]> = T extends [...any, infer O extends SearchOptions]
        ? AllValues<O, AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>>
        : AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>;
    export type AllValues<T extends Record<string, any>, U extends unknown> = T extends { all: true; } ? U[] : U;
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

    export const Section: ({ children, style, margin, ...props }: SectionProps) => React.JSX.Element;

    export function find(filter: Filter, options?: SearchOptions): any;

    export type Filter = (mdl: any, id: number | string) => boolean | never;

    export const Switch: any;
    export const Checkbox: any;

    export function Overflow(options: OverflowProps): React.JSX.Element;

    interface OverflowProps {
        items: OverflowItem[] | Array<OverflowItem[]>;
        title?: string;
        iconSource?: number;
        scale?: number;
        style?: ViewStyle;
    }

    interface OverflowItem {
        label: string;
        IconComponent?: React.ComponentType;
        iconSource?: number;
        action: () => any;
    }

    export function Search(props: SearchProps): React.JSX.Element;

    interface SearchProps extends TextInputProps {
        onClear: Fn;
        isRound?: boolean;
        isClearable?: boolean;
        leadingIcon?: any;
    }
}

declare module '@unbound/dialogs' {
    import type { ReactElement } from "react";

    export function showAlert(options: AlertProps): void;

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

declare module '@unbound/i18n' {
    export function add(strings: LocaleStrings): { remove: () => void; };

    type LocaleStrings = Record<string, Record<string, any>>;

    export const state: { locale: string; messages: {}; };
    export const Strings: any;
}

declare module '@unbound/metro/api' {
    export const Linking: AnyProps<{ openURL: any; openDeeplink: any; }>;
    export const AsyncUsers: AnyProps<{ fetchProfile: any; }>;
    export const Profiles: AnyProps<{ showUserProfile: any; }>;
}

declare module '@unbound/metro/common' {
    import type { StyleProp, TextStyle, ViewStyle, ImageStyle } from "react-native";

    export const ReactNative: typeof globalThis.ReactNative;
    export const React: typeof globalThis.React;
    export const Reanimated: typeof import('react-native-reanimated');
    export const Gestures: typeof import('react-native-gesture-handler');
    export const Clipboard: typeof import('@react-native-clipboard/clipboard');
    export const Flux: Common.Flux;

    export namespace Common {
        export interface StyleSheet {
            createStyles: <T extends Record<string, StyleProp<ViewStyle | TextStyle | ImageStyle>>>(style: T) => Fn<T>;
        }

        export type React = typeof import('react');
        export type ReactNative = typeof import('react-native');
        export type Reanimated = typeof import('react-native-reanimated');
        export type Gestures = typeof import('react-native-gesture-handler');

        export interface Dispatcher {
            dispatch(payload: Record<string, any>): Promise<void>;
            unsubscribe(event: string, handler: Fn): void;
            subscribe(event: string, handler: Fn): void;
        }

        export interface Flux {
            Store: (new (dispatcher: Dispatcher, listeners: Record<string, ({ [key: string]: any; })>) => any);
            connectStores: Fn;
        }

        export type Moment = typeof import('moment');
        export type Events = typeof import('events');
        export type Clipboard = typeof import('@react-native-clipboard/clipboard');
    }

    export const Moment: typeof import('moment');
    export const StyleSheet: AnyProps<{ createStyles: any; }>;
    export const Dispatcher: AnyProps<{ _dispatch: any; }>;
    export const Constants: AnyProps<{ Fonts: any; Endpoints: any; }>;
    export const Theme: AnyProps<{ colors: any; internal: any; }>;
    export const REST: AnyProps<{ getAPIBaseURL: any; }>;
    export const i18n: AnyProps<{ Messages: any; _requestedLocale: any; }>;
}

declare module '@unbound/metro/components' {
    export const Redesign: Module<"Button" | "TextInput" | "IconButton" | "openAlert" | "AlertModal" | "AlertActionButton" | "Navigator" | "Backdrop" | "useNavigation" | "dismissAlerts" | "TableRowGroup" | "ContextMenu" | "TableRow" | "TableSwitchRow" | "TableRowIcon" | "TableRowDivider" | "SegmentedControlPages" | "SegmentedControl" | "RowButton" | "Card" | "Pile" | "PileOverflow" | "Tabs" | "useSegmentedControlState">;

    export type Module<TProps extends string> = PropertyRecordOrArray<TProps[], TProps>;
    export type PropertyRecordOrArray<T extends any[], U extends string> = T extends BulkFind<U>
        ? BulkModuleByProperty<T>
        : SingleModuleByProperty<T>;
    export type BulkFind<T extends string> = [...AnyProps<{ params: T[]; }>[], AnyProps<{ bulk: true; }>];
    export type BulkModuleByProperty<T extends any[]> = {
        [K in keyof T]: AnyProps<{
            [P in T[K]['params'][number]]: any
        }>
    };
    export type SingleModuleByProperty<T extends any[]> = T extends [...any, infer O extends SearchOptions]
        ? AllValues<O, AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>>
        : AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>;
    export type AllValues<T extends Record<string, any>, U extends unknown> = T extends { all: true; } ? U[] : U;
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

    export const Slider: any;
    export const Media: AnyProps<{ openMediaModal: any; }>;
    export const HelpMessage: Fn<any>;
}

declare module '@unbound/metro/filters' {
    export function byProps(...props: string[]): Filter;

    export type Filter = (mdl: any, id: number | string) => boolean | never;

    export function byPrototypes(...prototypes: string[]): Filter;

    export function byDisplayName(name: string): Filter;

    export function byName(name: string): Filter;

    export function byStore(name: string, short?: boolean): Filter;
}

declare module '@unbound/metro' {
    export function addListener(listener: (mdl: any) => void): () => boolean;

    export function removeListener(listener: (mdl: any) => void): void;

    export function findLazy(filter: (mdl: any) => boolean, options?: Omit<SearchOptions, "lazy" | "all">): any;

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

    export function find(filter: Filter, options?: SearchOptions): any;

    export type Filter = (mdl: any, id: number | string) => boolean | never;

    export function bulk(...items: BulkItem[]): any[];

    export interface BulkItem extends Omit<SearchOptions, 'initial' | 'cache'> {
        filter: Filter;
    }

    export function findByProps<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): PropertyRecordOrArray<T, U>;

    export type PropertyRecordOrArray<T extends any[], U extends string> = T extends BulkFind<U>
        ? BulkModuleByProperty<T>
        : SingleModuleByProperty<T>;
    export type BulkModuleByProperty<T extends any[]> = {
        [K in keyof T]: AnyProps<{
            [P in T[K]['params'][number]]: any
        }>
    };
    export type SingleModuleByProperty<T extends any[]> = T extends [...any, infer O extends SearchOptions]
        ? AllValues<O, AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>>
        : AnyProps<{ [k in Exclude<T[number], Record<string, any>>]: any }>;
    export type AllValues<T extends Record<string, any>, U extends unknown> = T extends { all: true; } ? U[] : U;
    export type StringFindWithOptions<T extends string, Options = SearchOptions> = [...T[], Options];
    export type BulkFind<T extends string> = [...AnyProps<{ params: T[]; }>[], AnyProps<{ bulk: true; }>];

    export function findByPrototypes<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): AnyProps<Record<string, any>>;

    export function findStore<U extends string, T extends U[] | StringFindWithOptions<U, StoreOptions>>(...args: T): AnyProps<Record<string, any>>;

    export interface StoreOptions extends SearchOptions {
        short?: boolean;
    }

    export function findByName<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): FunctionSignatureOrArray<T, U>;

    export type FunctionSignatureOrArray<T extends any[], U extends string> = T extends BulkFind<U>
        ? BulkModuleByName<T>
        : SingleModuleByName<T>;
    export type BulkModuleByName<T extends any[]> = {
        [K in keyof T]: T[K] extends { interop: false; }
        ? { default: Fn; }
        : Fn
    };
    export type SingleModuleByName<T extends any[]> = T extends [...any, infer O extends SearchOptions]
        ? AllValues<O, O extends { interop: false; }
            ? { default: Fn; }
            : Fn>
        : Fn;

    /**
     * This algorithm is significantly different from a regular search.
     * Due to its nature, it works for the
     * @findByProps filter only.
     * It does a one-time operation at startup where it assigns every property
     * in each module into a map and then assigns the indexes of modules that
     * include this prop inside as a Set (there should be no duplicate indexes).
     *
     * Here is an example of how this works:
     * First, let's assume we have some object like this (Discord's module object is much
     * larger scaled at around 9000 items but this is a small scale example):
     * @example
     * 	const data = [
     * 		{
     * 			test: 5,
     * 			other: 'hello world',
     * 			hello: 'world'
     * 		},
     * 		{
     * 			navigation: {
     * 				abcd: 5,
     * 				testing: 6
     * 			},
     *
     * 			getNavigation() {
     * 				return this.navigation
     * 			}
     * 		},
     * 		{
     * 			test: 8,
     *
     * 			meow() {
     * 				console.log('meow');
     * 			},
     *
     * 			items: [2, 4, 6, 8, 10]
     * 		},
     * 		{
     * 			idk: '4 things',
     * 			test: [56, 2]
     * 		}
     * 	]
     * @end
     *
     * If we were to apply the mapping, we would end up with something like:
     * @example
     * 	Map (8) {
     * 	    "test" => Set (3) {0, 2, 3}
     * 	    "other" => Set (1) {0}
     * 	    "hello" => Set (1) {0}
     * 	    "navigation" => Set (1) {1}
     * 	    "getNavigation" => Set (1) {1}
     * 	    "meow" => Set (1) {2}
     * 	    "items" => Set (1) {2}
     * 	    "idk" => Set (1) {3}
     * 	}
     * @end
     * @question So what's the intuition behind this?
     * @answer Well, as you can see
     * @test has 3 items inside.
     * This is because the
     * @test property appears in the 0th
     * object, the 2nd object, and the 3rd object in our example.
     * This being, 3 objects in total, hence 3 indexes inside,
     * pointing to the correct indexes in the array.
     * @question Okay, so how do we find modules with this?
     * @answer By getting the indexes that all of the properties share.
     * If we search for
     * @test and
     * @other then they both share the index 0,
     * so we can say that the object we're looking for is that the 0th
     * index, then we can simply index our original array at that index!
     * If we instead search for
     * @test and
     * @items then they both share
     * the index of 2, so we can do the same thing and index our original array.
     * If we search for
     * @test
     * @items and
     * @other then they dont all share
     * an index, so this means that no object exists with all 3 of these keys
     * inside. For a case like this we can return null.
     * @question How do the speeds compare?
     * @answer Let's discuss the logical aspect first, in terms of Big O notation.
     * With our old algorithm, where k is the number of properties to search for,
     * and n is the size of the object, the best case scenario is O(k) (if the
     * item you're searching for is at the 0th index) and a worst case of O(n*k)
     * (if the item you're looking for is at the very last index).
     *
     * With our new algorithm, we perform a one-time operation of mapping the object,
     * which is O(n*m), where n is the object length and m is the average number of
     * properties per object. However, execution after the fact is *always* O(k),
     * because accessing the map to get the indexes that the property appears in
     * only needs to happen as many times as there are keys searched for in the
     * function call, and operations to parse the indexes are negligible.
     *
     * In simler terms, we only need to access the map as many times as there are
     * properties when calling the function, and accessing maps is O(1).
     *
     * We have also tested the speed, in a worst case scenario for both cases.
     * First, we create a very large array of objects (of length 100,000).
     * @example
     * 	const data = new Array(1e5).fill(null).map(x => ({}));
     *
     * 	data.push({
     *       prop1: 'assume this is important',
     * 	     test: [56, 2]
     * 	})
     * @end
     *
     * Then we test the speed with searching for the very last module in both cases,
     * and we test 1e4 (10,000) times to get a good average result.
     * @example
     * 	 function testSpeed(callback: CallableFunction, label: string, iterations = 1e4) {
     * 	     const results = [];
     *
     *       for (let i = 0; i < iterations - 1; i++) {
     * 	         const start = performance.now();
     * 	         callback('test', 'prop1');
     * 	         const end = performance.now();
     *
     * 	         results.push(end - start);
     * 	     }
     *
     * 	     console.log(`${label} - ${results.reduce((pre, cur) => pre + cur, 0) / iterations}`);
     * 	 }
     *
     *   testSpeed(slowFindByProps, 'Slow');
     *   testSpeed(fastFindByProps, 'Fast');
     * @end
     *
     * The results (rounded, with array size 1e5 and 1e4 iterations):
     * @slow 10 results
     * 1.6411299999892712
     * 1.8532500000119213
     * 1.7846800000071525
     * 1.7910600000202657
     * 1.7802800000071526
     * 1.7538200000047683
     * 1.7722900000095367
     * 1.8124300000011921
     * 1.7448499999761582
     * 1.8099299999952316
     * @fast 10 results
     * 0.0006600000202656
     * 0.0006199999988079
     * 0.0006300000071526
     * 0.0005900000333786
     * 0.0006100000023842
     * 0.0005900000095367
     * 0.0005900000154972
     * 0.0005399999976158
     * 0.0006099999964237
     * 0.0006599999845028
     *
     * TS Playground Link to test yourself:
     * @link https://bit.ly/fastFindByProps
     */
    export function fastFindByProps<U extends string, T extends U[] | StringFindWithOptions<U> | BulkFind<U>>(...args: T): PropertyRecordOrArray<T, U>;

    export const on: typeof addListener;

    export function addListener(listener: (mdl: any) => void): () => boolean;

    export const off: typeof removeListener;

    export function removeListener(listener: (mdl: any) => void): void;
}

declare module '@unbound/metro/stores' {
    export const Guilds: AnyProps<Record<string, any>>;
    export const Theme: AnyProps<Record<string, any>>;
    export const Users: AnyProps<Record<string, any>>;
}

declare module '@unbound/native' {
    export function reload(instant?: boolean): Promise<void>;

    export function getNativeModule(...names: string[]): any;

    export const BundleInfo: any;
    export const BundleManager: any;
    export const DeviceInfo: any;
}

declare module '@unbound/patcher' {
    export function before<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: BeforeOverwrite<M[P]>, once?: boolean): () => void;

    export type BeforeOverwrite<F extends Fn> = (context?: any, args?: Parameters<F>, original?: F, unpatch?: () => void) => Parameters<F> | void;

    export function instead<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: InsteadOverwrite<M[P]>, once?: boolean): () => void;

    export type InsteadOverwrite<F extends Fn> = (context?: any, args?: Parameters<F>, original?: F, unpatch?: () => void) => ReturnType<F> | void;

    export function after<M extends Record<P, Fn>, P extends PropOf<M>>(caller: string, mdl: M, func: P, callback: AfterOverwrite<M[P]>, once?: boolean): () => void;

    export type AfterOverwrite<F extends Fn> = (context?: any, args?: Parameters<F>, result?: ReturnType<F>, unpatch?: () => void) => ReturnType<F> | void;

    export function createPatcher(name: string): { getPatchesByCaller: typeof getPatchesByCaller; before<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: BeforeOverwrite<M[P]>, once?: boolean): () => void; instead<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: InsteadOverwrite<M[P]>, once?: boolean): () => void; after<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: AfterOverwrite<M[P]>, once?: boolean): () => void; unpatchAll: () => void; };

    export function getPatchesByCaller(id?: string): Patcher[];

    export interface Patcher {
        caller: string;
        once: boolean;
        type: Type;
        id: number;
        callback: any;
        unpatch: () => void;
    }

    export function createPatcher(name: string): { getPatchesByCaller: typeof getPatchesByCaller; before<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: BeforeOverwrite<M[P]>, once?: boolean): () => void; instead<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: InsteadOverwrite<M[P]>, once?: boolean): () => void; after<M extends Record<P, Fn<any>>, P extends PropOf<M>>(mdl: M, func: P, callback: AfterOverwrite<M[P]>, once?: boolean): () => void; unpatchAll: () => void; };

    export function unpatchAll(caller?: string): void;

    export enum Type {
        Before = 'before',
        Instead = 'instead',
        After = 'after'
    }

    export const patches: Patch[];

    export interface Patch {
        mdl: Record<string, any> | Function;
        func: string;
        original: Function;
        unpatch: () => void;
        patches: {
            before: Patcher[];
            after: Patcher[];
            instead: Patcher[];
        };
    }
}

declare module '@unbound/storage' {
    export function get<T extends any>(store: string, key: string, def: T): T & {};

    export function set(store: string, key: string, value: any): void;

    export function toggle(store: string, key: string, def: any): void;

    export function remove(store: string, key: string): void;

    export function getStore(store: string): { set: (key: string, value: any) => void; get: <T extends unknown>(key: string, def: T) => T & {}; toggle: (key: string, def: any) => void; remove: (key: string) => void; useSettingsStore: () => { set: (key: string, value: any) => void; get: <T extends unknown>(key: string, def: T) => T & {}; toggle: (key: string, def: any) => void; remove: (key: string) => void; }; };

    export function useSettingsStore(store: string, predicate?: (payload: Payload) => boolean): { set: (key: string, value: any) => void; get: <T extends unknown>(key: string, def: T) => T & {}; toggle: (key: string, def: any) => void; remove: (key: string) => void; };

    export interface Payload {
        store: string;
        key: string;
        value: any;
    }

    export const DCDFileManager: DCDFileManagerType;

    export type DCDFileManagerType = DCDFileManagerConstants & {
        readFile(path: string, encoding: 'utf-8' | 'utf8' | 'base64'): Promise<string>;
        writeFile(type: 'documents' | 'cache', path: string, data: string, encoding: 'utf-8' | 'utf8' | 'base64'): Promise<string>;
        removeFile(type: 'documents' | 'cache', path: string): Promise<any>;
        readAsset(): Promise<unknown>;
        getSize(): Promise<unknown>;
        getVideoDimensions(): Promise<unknown>;
        fileExists(path: string): Promise<boolean>;
        saveFileToGallery(): Promise<unknown>;
        CacheDirPath: string;
        DocumentsDirPath: string;
        getConstants(): DCDFileManagerConstants;
    };
    export type DCDFileManagerConstants = {
        CacheDirPath: string;
        DocumentsDirPath: string;
    };

    export const settings: any;
    export const on: any;
    export const off: any;
    export const pendingReload: { value: boolean; };
}

declare module '@unbound/toasts' {
    import type { ImageSourcePropType } from "react-native";

    export function showToast(options: ToastOptions): { update(newOptions: Nullable<ToastOptions>): void; close(): void; };

    export type ToastOptions = _ToastOptions | PartialBy<_ToastOptions, 'title'> | PartialBy<_ToastOptions, 'content'>;

    interface _ToastOptions {
        title: string;
        content: string;
        duration?: number;
        onTimeout?: Fn;
        icon?: string | number | ImageSourcePropType;
        id?: any;
        buttons?: ToastButton[];
        tintedIcon?: boolean;
    }

    export interface ToastButton {
        color?: ButtonColors[keyof ButtonColors];
        variant?: ButtonLooks[keyof ButtonLooks] | 'primary' | 'secondary' | 'tertiary';
        size?: ButtonSizes[keyof ButtonSizes] | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        iconPosition?: 'start' | 'end';
        content: string;
        icon?: number;
        onPress: Fn;
    }

    export interface ButtonColors {
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

    export interface ButtonLooks {
        FILLED: 'filled';
        LINK: 'link';
        OUTLINED: 'outlined';
    }

    export interface ButtonSizes {
        XSMALL: 'xsmall';
        SMALL: 'small';
        MEDIUM: 'medium';
        LARGE: 'large';
    }
}

declare module '@unbound/utilities' {
    /**
     * @description Compares 2 semantic versions.
     * @cases
     * @ > 0 - versionA is newer than versionB
     * @ < 0 - versionA is older than versionB
     * @ = 0 - versionA and versionB are the same
     * @param {T extends string} versionA
     * @param {T extends string} versionB
     * @return {number}
     */
    export function compareSemanticVersions(versionA: string, versionB: string): number;

    export function callbackWithAnimation<T extends Fn>(callback: T, duration?: number): T;

    /**
     * @description Traverses through a react tree
     * @param {(object|array)} tree - The tree to search through
     * @param {function} filter - The filter to run on the tree passed as the first argument
     * @param {object} options - Options to pass to findInTree
     * @return {any} Returns null if nothing is filtered or the value that is filtered.
     */
    export function findInReactTree(tree: any[] | Record<string, any>, filter?: Function, options?: {}): any;

    /**
     * Returns the color provided as a hex string without opacity.
     * @param color The color to format
     * @returns string
     */
    export function withoutOpacity(color: any): string;

    export function forceRender(component: any): (...args: any[]) => any;

    /**
     * @description Merges styles and allows predicates to return false
     * @param {...object} styles - Style objects
     * @return {object} Returns a merged style object.
     */
    export function mergeStyles(...styles: (boolean | Record<any, any>)[]): Record<any, any>;

    /**
     * @description Splits an array into chunks of the specified size. Useful for concurrency.
     * @param {array} array - The array to split into chunks
     * @param {number} size - The size of each chunk
     * @return {array} Returns the array of chunks
     */
    export function chunkArray<T>(array: T[], size: number): T[][];

    /**
     * @name capitalize
     * @description Capitalizes the first letter of a string.
     * @param {string} string - The string to capitalize the first letter of
     * @return {string} Returns a string with an uppercased first letter
     */
    export function capitalize(input: string): string;

    /**
     * @description Searches through the walkables provided inside a tree.
     * @param {object|array} tree - The tree to search
     * @param {function} filter - The filter to use to resolve the search
     * @param {object} options - The options for the search
     * @param {array} [options.ignore=[]] - The keys to ignore in the search
     * @param {array} [options.walkable=[]] - The keys to walk/traverse in the search
     * @param {number} [options.maxProperties=100] - The keys to walk/traverse in the search
     * @return {function} Returns the function with a cacheable value
     */
    export function findInTree(tree?: any[] | Record<string, any>, filter?: Function, options?: { ignore?: any[]; walkable?: any[]; maxProperties?: number; }): any;

    /**
     * Maps a nunber from 0 to 1 into a 2-character hex string.
     * @param number The number to parse into a hex string
     * @returns string
     */
    export function unitToHex(number: number): string;

    /**
     * @description Throttles a function by the provided milliseconds
     * @param {function} func - The function to debounce
     * @param {number} ms - The milliseconds to debounce the function by
     * @return {function} Returns an instance of the function wrapped in a debounce
     */
    export function debounce(func: Fn<any>, ms: number): Fn<any>;

    /**
     * @description Attempts calling a function and bails if it fails
     * @param {function} func - The function to debounce
     * @return {boolean|Promise<boolean>}
     */
    export function attempt(func: Fn<any>): boolean | Promise<boolean>;

    export function isEmpty(object: Record<any, any>): boolean;

    export function noop(...args: any): any;

    /**
     * @name uuid
     * @description Returns a UUID with the length provided (default: 30)
     * @param {number} [length=30] - The length of the randomized UUID
     * @return {string} Returns the randomized UUID.
     */
    export function uuid(length?: number): string;
}

declare module '@unbound' {
    export * as assets from "@unbound/assets";
    export * as commands from "@unbound/commands";
    export * as components from "@unbound/components";
    export * as dialogs from "@unbound/dialogs";
    export * as i18n from "@unbound/i18n";
    export * as metro from "@unbound/metro";
    export * as native from "@unbound/native";
    export * as patcher from "@unbound/patcher";
    export * as storage from "@unbound/storage";
    export * as toasts from "@unbound/toasts";
    export * as utilities from "@unbound/utilities";
    export * as default from "@unbound";
}
