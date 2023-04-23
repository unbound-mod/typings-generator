import { printSync } from '@swc/core';

export default function (data: Visitor) {
	const { node, parent, store, parentStore } = data;

	// if (Array.isArray(parent)) return;

	node.declare = false;

	if (node.superClass && store.variables.has(node.superClass.value)) {
		const value = store.variables.get(node.superClass.value);
		value.include = true;
		value.imports = store.variables;
		parentStore.variables.set(node.superClass.value, value);
	}

	store.variables.set(node.identifier.value, {
		kind: node.type,
		_raw: node,
		contents: printSync({
			body: [Array.isArray(parent) ? node : parent],
			type: 'Module',
			interpreter: null,
			span: {
				start: 0,
				end: node.span.end - node.span.start,
				ctxt: node.span.ctxt
			}
		})
	});
}
