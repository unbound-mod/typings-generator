import { resolvePath } from '@util/path';
import visit from '@util/visit';
import { extname } from 'path';

const wrapExport = node => ({
	type: 'ExportDeclaration',
	declaration: node,
	span: {
		start: 0,
		end: 0,
		ctxt: 0
	}
});

export default function (data: Visitor) {
	const { node, store, dir } = data;

	if (!node.source) return;

	const path = resolvePath(node.source.value, dir);
	const contents = visit(path, store);

	for (const spec of node.specifiers) {
		const name = spec.name?.value ?? spec.exported?.value;
		const kind = spec.type;

		const variable = spec.exported && contents.exports.get(spec.exported.value);
		if (contents.variables.has("_default") && spec.exported) {
			contents.variables.get("_default").exportedAs = spec.exported.value;
		}

		if (variable) {
			variable.exportedAs = spec.exported.value;
		}

		const exportee = contents?.exports.get(spec.orig?.value)?.contents;

		store.exports.set(name, {
			_raw: node,
			kind,
			type: node.type,
			namespace: node.source.value,
			exported: variable,
			contents: extname(path) === '.json'
				? null
				: exportee ? exportee : contents
		});
	}
}
