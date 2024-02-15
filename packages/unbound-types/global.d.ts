import "./utilities";
import "./api";

declare global {
    const __r: {
        	importAll: Fn;
        } & ((id: number | string) => void);
    var React: typeof import('react');
    var ReactNative: typeof import('react-native');
    var modules: { [id: number]: any; };
    var nativeLoggingHook: Fn;
    var unbound: typeof import('@unbound') & { version: string; };
    var manifest: Manifest;
    var settings: ReturnType<typeof getStore>;

    interface Window {
        loader: {
            	type: string;
            	version: string;
            };
        UNBOUND_DEV_IP: string;
        UNBOUND_SETTINGS: {
            	contents: string;
            	path: string;
            }[];
        UNBOUND_PLUGINS: {
            	manifest: Manifest,
            	bundle: string;
            }[];
        UNBOUND_FONTS: {
            	name: string;
            	path: string;
            }[];
        UNBOUND_THEMES: {
            	manifest: Manifest,
            	bundle: string;
            }[];
    }
}

export interface Manifest {
    id: string;
    name: string;
    description: string;
    authors: Author[];
    icon: '__custom__' | (string & {}) | { uri: string; };
    updates: string;
    version: string;
    folder: string;
    path: string;
    url: string;
}

export type Author = {
    	name: string;
    	id: `${number}`;
    };

export function getStore(store: string): any;

export { };
