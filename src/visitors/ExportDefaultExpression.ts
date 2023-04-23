import { printSync } from '@swc/core';

export default function (data: Visitor) {
	const { parent, node, store } = data;

	switch (node.expression.type) {
		case 'Identifier': {
			const variable = store.variables.get(node.expression.value);

			if (!variable) {
				console.warn(`Couldn't find variable ${node.expression.value} in`, store);
				break;
			}

			store.exports.set('default', {
				kind: node.type,
				contents: variable.contents,
				declared: true,
			});
		} break;

		case 'ObjectExpression':
		case 'NewExpression': {
			store.exports.set('default', {
				kind: node.type,
				_raw: node,
				contents: printSync({
					body: Array.isArray(parent) ? parent : [parent],
					type: 'Module',
					interpreter: null,
					span: {
						start: 0,
						end: node.span.end - node.span.start,
						ctxt: node.span.ctxt
					}
				})
			});
		} break;

		default: console.warn(`Unhandled ${node.expression.type} for ${node.type}`, node);
	}
}
