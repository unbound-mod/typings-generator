import { resolvePath } from '@util/path';
import visit from '@util/visit';

export default function (data: Visitor) {
	const { node, dir, store } = data;

	const path = resolvePath(node.source.value, dir);
	const contents = visit(path);

	for (const [key, value] of contents.exports.entries()) {
		store.exports.set(key, value);
	}
}
