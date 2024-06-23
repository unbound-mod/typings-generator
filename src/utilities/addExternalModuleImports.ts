import { ImportDeclaration, StructureKind, type ModuleDeclaration, type SourceFile } from 'ts-morph';

function addExternalModuleImports(destination: ModuleDeclaration | SourceFile, cache: DeclarationCache, i: ImportDeclaration) {
	const source = i.getModuleSpecifierSourceFile();
	const file = i.getSourceFile();

	if (!source?.isInNodeModules() || file.isInNodeModules()) {
		return [];
	}


	const mdl = i.getModuleSpecifierValue();

	let existingNonTypedImport = destination.getImportDeclarations().find(i => i.getModuleSpecifierValue() === mdl && !i.isTypeOnly());
	let existingTypedImport = destination.getImportDeclarations().find(i => i.getModuleSpecifierValue() === mdl && i.isTypeOnly());

	let existingNonTypedNamespaceImport = destination.getImportDeclarations().find(i => i.getModuleSpecifierValue() === mdl && i.getNamespaceImport() && !i.isTypeOnly());
	let existingTypedNamespaceImport = destination.getImportDeclarations().find(i => i.getModuleSpecifierValue() === mdl && i.getNamespaceImport() && i.isTypeOnly());

	const named = i.getNamedImports();

	for (const name of named) {
		const declaration = name.getImportDeclaration();
		if (!declaration) continue;

		if (declaration.isTypeOnly() && (!existingTypedImport || !existingTypedImport?.getNamedImports().find(r => r.getName() === name.getName()))) {
			existingTypedImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: true,
				namedImports: [name.getName()]
			});

			if (!existingTypedImport.getNamedImports().some(i => i.getName() === name.getName())) {
				existingTypedImport.addNamedImport(name.getName());
			}
		}

		if (!declaration.isTypeOnly() && (!existingNonTypedImport || !existingNonTypedImport?.getNamedImports().find(r => r.getName() === name.getName()))) {
			existingNonTypedImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: false,
				namedImports: [name.getName()]
			});

			if (!existingNonTypedImport.getNamedImports().some(i => i.getName() === name.getName())) {
				existingNonTypedImport.addNamedImport(name.getName());
			}
		}
	}

	const def = i.getDefaultImport();
	if (def) {
		if (i.isTypeOnly()) {
			existingTypedImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: true,
				defaultImport: def.getText()
			});
		} else {
			existingNonTypedImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: false,
				defaultImport: def.getText()
			});
		}

		const storage = i.isTypeOnly() ? existingTypedImport : existingNonTypedImport;

		if (!storage.getDefaultImport()) {
			storage.setDefaultImport(def.getText());
		}
	}

	const name = i.getNamespaceImport();
	if (name) {
		if (i.isTypeOnly()) {
			existingTypedNamespaceImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: true,
				namespaceImport: name.getText()
			});
		} else {
			existingNonTypedNamespaceImport ??= destination.addImportDeclaration({
				moduleSpecifier: mdl,
				kind: StructureKind.ImportDeclaration,
				isTypeOnly: false,
				namespaceImport: name.getText()
			});
		}

		const storage = i.isTypeOnly() ? existingTypedNamespaceImport : existingNonTypedNamespaceImport;

		if (!storage.getNamespaceImport()) {
			storage.setDefaultImport(def.getText());
		}
	};
}

export default addExternalModuleImports;