import Visitors from '.';

export default function (data: Visitor) {
	const { node } = data;

	if (!Visitors[node.declaration.type]) {
		console.warn('Unhandled export visitor type:', node.declaration.type);
	}

	switch (node.declaration.type) {
		case 'TsInterfaceDeclaration':
		case 'FunctionDeclaration':
		case 'TsEnumDeclaration':
		case 'VariableDeclaration':
		case 'TsTypeAliasDeclaration': {
			node.declare = false;

			Visitors[node.declaration.type]({
				...data,
				node: node.declaration,
				parent: node,
				isExport: true
			});
		} break;

		default:
			console.warn(`Unhandled ${node.declaration.type}`, node);
	}
}
