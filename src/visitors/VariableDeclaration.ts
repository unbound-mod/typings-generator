import { printSync } from '@swc/core';

export default function (data: Visitor & { isExport?: boolean; }) {
	const { node, parent, store, isExport, parentStore } = data;
	const body = [Array.isArray(parent) ? node : parent];

	node.declare = false;

	for (const decl of node.declarations) {
		if (decl.id.value === '_default') {
			body[0] = {
				type: 'ExportDeclaration',
				declaration: body[0],
				span: {
					start: 0,
					end: 0,
					ctxt: 0
				}
			};
		}

		const typeAnnotation = decl.id?.typeAnnotation?.typeAnnotation?.typeName;
		const isIdentifier = typeAnnotation?.type === "Identifier";
		if (isIdentifier && store.variables.has(typeAnnotation.value)) {
			const value = store.variables.get(typeAnnotation.value);
			value.include = true;
			parentStore.variables.set(typeAnnotation.value, value);
		}

		(isExport ? store.exports : store.variables).set(decl.id.value, {
			kind: node.type,
			contents: {
				makeCode() {
					return printSync({
						body: body,
						type: 'Module',
						interpreter: null,
						span: {
							start: 0,
							end: node.span.end - node.span.start,
							ctxt: node.span.ctxt
						}
					}).code;
				},
				get code() { return this.__code ??= this.makeCode(); },
				set code(value) { this.__code = value; }
			},
			get exportedAs() { return decl.id.value; },
			set exportedAs(value) { decl.id.value = value; this.contents.code = this.contents.makeCode(); },
		});
	}
}
