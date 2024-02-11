import type { ModuleDeclaration, SourceFile } from 'ts-morph';

function appendTypesToNode(file: SourceFile, node: SourceFile | ModuleDeclaration, condition?: 'hasDeclareKeyword' | 'isExported') {
	const interfaces = file.getInterfaces();
	for (const i of interfaces) {
		if (!condition || (condition && i[condition]())) {
			node.addInterface(i.getStructure());
		}
	}

	const types = file.getTypeAliases();
	for (const t of types) {
		if (!condition || (condition && t[condition]())) {
			node.addTypeAlias(t.getStructure());
		}
	}
}

export default appendTypesToNode;