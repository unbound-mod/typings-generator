import { join } from 'path';

export const TypesFolder = join(__dirname, '..', 'packages', 'unbound-types');

export const Regex = {
	NOT_INDEX: /index\.((j|t)s(x|))/gmi,
	EXTENSIONS: /\.((j|t)s(x|))/g
};

export const Overrides = {
	Variables: {
		React: 'React: typeof globalThis.React',
		ReactNative: 'ReactNative: typeof globalThis.ReactNative',
		Reanimated: 'Reanimated: typeof import("react-native-reanimated")',
		Gestures: 'Gestures: typeof import("react-native-gesture-handler")',
		Clipboard: 'Clipboard: typeof import("@react-native-clipboard/clipboard")',
		Moment: 'Moment: typeof import("moment")'
	}
};

export const Colors = {
	reset: '\u001b[0m',
	base: '\u001b[39m',
	bgBase: '\u001b[49m',
	bold: '\u001b[1m',
	normal: '\u001b[2m',
	italic: '\u001b[3m',
	underline: '\u001b[4m',
	inverse: '\u001b[7m',
	hidden: '\u001b[8m',
	strike: '\u001b[9m',
	black: '\u001b[30m',
	red: '\u001b[31m',
	green: '\u001b[32m',
	yellow: '\u001b[33m',
	blue: '\u001b[34m',
	magenta: '\u001b[35m',
	cyan: '\u001b[36m',
	white: '\u001b[37m',
	gray: '\u001b[90m',
	bgBlack: '\u001b[40m',
	bgRed: '\u001b[41m',
	bgGreen: '\u001b[42m',
	bgYellow: '\u001b[43m',
	bgBlue: '\u001b[44m',
	bgMagenta: '\u001b[45m',
	bgCyan: '\u001b[46m',
	bgWhite: '\u001b[47m'
};