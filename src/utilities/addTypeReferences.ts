import { Node, SyntaxKind, type ModuleDeclaration, type SourceFile } from 'ts-morph';
import { add } from '~/utilities';

function getTypeReferences(node: Node, destination: ModuleDeclaration | SourceFile, cache: DeclarationCache) {
	const stack = [node, ...node.getDescendantsOfKind(SyntaxKind.TypeReference)];

	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		const children = [node, ...node.getDescendantsOfKind(SyntaxKind.TypeReference)];

		useStack(children, destination, cache);

		for (const child of children) {
			const next = child.getDescendantsOfKind(SyntaxKind.TypeReference) ?? [];
			stack.push(...next);
		}
	}
}


function useStack(stack: Node[], destination: ModuleDeclaration | SourceFile, cache: DeclarationCache) {
	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		handleNode(stack, node, destination, cache);

		stack.push(...node.getChildren());
	}
}

function handleNode(stack: Node[], node: Node, destination: ModuleDeclaration | SourceFile, cache: DeclarationCache) {
	if (cache.references.has(node.getSymbol())) return;
	if (node.getSourceFile().isInNodeModules()) return;

	// Handle class extensions
	// if (Node.isHeritageClause(node) && node.getParentIfKind(SyntaxKind.ClassDeclaration)) {
	// 	// console.log(node.getText());
	// 	const identifier = node.getDescendantsOfKind(SyntaxKind.Identifier);

	// 	for (const id of identifier) {
	// 		const decl = id.getType()?.getSymbol()?.getDeclarations() ?? [];
	// 		for (const dec of decl) {
	// 			if (Node.isClassDeclaration(dec)) {
	// 				const hasSameName = destination.getChildren().some(d => Node.isNamed(d) && d.getName() === dec.getName());

	// 				if (hasSameName) {
	// 					dec.rename('__' + dec.getName());
	// 				}

	// 				id.rename(dec.getName());
	// 				add(dec, destination, cache);
	// 			}
	// 			// console.log(dec.getKindName());
	// 		}
	// 	}
	// }

	if (Node.isTypeReference(node)) {
		const identifiers = node.getDescendantsOfKind(SyntaxKind.Identifier);

		// Handle external node_modules type references
		for (const identifier of identifiers) {
			const declarations = identifier.getSymbol().getDeclarations();

			for (const declaration of declarations) {
				if (Node.isImportSpecifier(declaration)) {
					const mdl = declaration.getImportDeclaration()?.getModuleSpecifierSourceFile();
					if (!mdl?.isInNodeModules()) continue;

					const nodeModule = declaration.getImportDeclaration().getModuleSpecifierValue();
					const imp = destination.getImportDeclaration(c => c.getModuleSpecifierValue() === nodeModule) ?? destination.addImportDeclaration({
						moduleSpecifier: nodeModule
					});

					if (!imp.getNamedImports().some(i => i.getName() === declaration.getName())) {
						imp.addNamedImport(declaration.getName());
					}
				} else if (Node.isImportClause(declaration)) {
					const impDecl = declaration.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
					if (!impDecl) continue;

					const mdl = impDecl.getModuleSpecifierSourceFile();
					if (!mdl.isInNodeModules()) continue;

					console.log(impDecl.getStructure());
					const hasImport = destination.getImportDeclaration(i => i.getModuleSpecifierValue() === impDecl.getModuleSpecifierValue());
					if (hasImport) continue;

					destination.addImportDeclaration(impDecl.getStructure());
				}
			}
		}

		const sym = node.getType().getSymbol();
		const aliasSym = node.getType().getAliasSymbol();
		if (!sym && !aliasSym) return;

		const declarations = [...sym?.getDeclarations() ?? [], ...aliasSym?.getDeclarations() ?? []];

		for (const declaration of declarations) {
			const file = declaration.getSourceFile();
			const filePath = file.getFilePath();
			if (file.isInNodeModules()) continue;

			if (Node.isTypeAliasDeclaration(declaration) || Node.isInterfaceDeclaration(declaration)) {
				// Most likely in a namespace or a global.
				if (declaration.hasDeclareKeyword()) continue;

				const exportExists = [...destination.getExportedDeclarations().keys()].find((name) => name === declaration.getName());
				const localModules = [...global.moduleMap.values()];
				const localModule = localModules.find(m => m.path === filePath || m.referencedFiles.has(filePath));
				const localModuleHasExport = localModule?.exported.has(declaration.getName());

				if (localModuleHasExport && !exportExists) {
					const moduleSpecifier = `@unbound/${localModule.name}`;
					const existingImport = destination.getImportDeclarations().find(r => r.getModuleSpecifier().getText() === `"${moduleSpecifier}"`);
					const importDeclaration = existingImport ?? destination.addImportDeclaration({ moduleSpecifier });

					const namedImportExists = importDeclaration.getNamedImports().find(i => i.getText() === declaration.getName());
					if (!namedImportExists) importDeclaration.addNamedImport(declaration.getName());

					if (Node.isTypeAliasDeclaration(declaration)) {
						cache.types.set(declaration.getSymbol(), declaration);
					} else {
						cache.interfaces.set(declaration.getSymbol(), declaration);
					}
				} else {
					// if (!declaration.getSourceFile().isInNodeModules()) {
					// if(==='LocaleStrings')
					if (!aliasSym && declaration.getSymbol() !== node.getSymbol()) {
						stack.push(declaration);
					}
					// }

					add(declaration, destination, cache, true);
				};
			}
		}
	}
}

export default getTypeReferences;