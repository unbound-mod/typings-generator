import type { ImportDeclaration } from 'ts-morph';

function getModuleTypeImports(i: ImportDeclaration) {
	const source = i.getModuleSpecifierSourceFile();
	const file = i.getSourceFile();
	const imports = [];

	if (!source.isInNodeModules() || file.isInNodeModules()) {
		return imports;
	}

	const named = i.getNamedImports();
	for (const name of named) {
		const declaration = name.getImportDeclaration();

		if (declaration) imports.push(i);
	}

	const def = i.getDefaultImport();
	if (def) imports.push(i);

	const space = i.getNamespaceImport();
	if (space) imports.push(i);

	return imports;
}

export default getModuleTypeImports;