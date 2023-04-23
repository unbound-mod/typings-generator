import { resolvePath } from '@util/path';
import visit from '@util/visit';
import { extname } from 'path';

export default function (data: Visitor) {
	const { node, store, dir } = data;

	for (const spec of node.specifiers) {
		if (!node.source) continue;


		const path = resolvePath(node.source.value, dir);
		const name = spec.name?.value ?? spec.exported?.value;
		const contents = visit(path, store);
		const kind = spec.type;

		console.log('a', { contents });

		const variable = spec.exported && contents.exports.get(spec.exported.value);
		if (contents.variables.has('_default') && spec.exported) {
			console.log(contents.exports.get('default'));
			contents.variables.get('_default').exportedAs = spec.exported.value;
		}

		if (variable) {
			variable.exportedAs = spec.exported.value;
		}
		// console.log('hi');
		// spec.orig.exported = spec.exported;
		// }
		// console.log(spec.type === 'ExportNamespaceSpecifier', contents, spec);

		store.exports.set(name, {
			_raw: node,
			kind,
			type: node.type,
			namespace: node.source.value,
			exported: variable,
			contents: extname(path) === '.json'
				? null
				: contents?.exports.get(spec.orig?.value)?.contents ?? contents
		});
	}
}
