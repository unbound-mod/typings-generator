import { Colors } from '~/constants';

type Color = keyof typeof Colors;

function colorize(string: string, color: Color = 'reset') {
	const fmt = Colors[color.toLowerCase() as Color];
	if (!fmt) return string;

	return fmt + string + Colors.reset;
};

export default colorize;