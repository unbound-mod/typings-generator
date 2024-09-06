import { Manifest } from "@unbound/managers";
import "./api";
import "./utilities";

declare global {
		namespace React {
		}

		const __r: {
				importAll: Fn;
		} & ((id: number | string) => void);
		var ReactNative: typeof import('react-native');
		var unbound: typeof import('@unbound') & { version: string; };

		interface Window {
				modules: { [id: number]: any; };
				nativeLoggingHook: Fn;
				DevTools: {
						connect: (options: {
								host: string;
								port?: string;
						}) => void;
				} | null;
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

export { };
