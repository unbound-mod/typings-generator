import { Node } from '@swc/core';

function expose(body: Node) {
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

export default expose;