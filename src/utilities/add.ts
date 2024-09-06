import {
	FunctionDeclarationStructure, ModuleDeclaration, SourceFile
} from 'ts-morph';
import { Node } from 'ts-morph';

function add(node: Node, destination: ModuleDeclaration | SourceFile, cache: DeclarationCache, removeExports = false) {
	if (Node.isFunctionDeclaration(node) && !cache.functions.has(node.getSymbol())) {
		node.setReturnType((node.getReturnType()).getText(node));

		// Async anotation is not allowed in ambient modules
		node.setIsAsync(false);

		// Remove function source
		node.removeBody();

		const parameters = node.getParameters();

		for (const parameter of parameters) {
			// Infer a parameter type if it is not already set
			parameter.setType(parameter.getType().getText(parameter));

			// Remove initializers for function parameters and make them optional instead
			if (parameter.hasInitializer()) {
				parameter.setHasQuestionToken(true);
				parameter.removeInitializer();
			}

			// Rename object nodes to options as ambient modules don't support object destructuring
			for (const child of parameter.getChildren()) {
				if (Node.isObjectBindingPattern(child)) {
					child.replaceWithText('options');
				}
			}
		}

		if (!removeExports) {
			node.setIsExported(true);
		} else {
			node.setIsExported(false);
		}

		node.setIsDefaultExport(false);

		destination.addFunction(node.getStructure() as FunctionDeclarationStructure);
		cache.functions.set(node.getSymbol(), node);
	} else if (Node.isVariableDeclaration(node) && !cache.variables.has(node.getSymbol())) {
		node.setType(node.getType().getText(node));
		// if (Node.isSymbolKeyword(node)) {
		// 	console.log('hi');
		// }

		// const sym = node.getSymbol();
		// const decl = sym.getDeclarations();

		// for (const declaration of decl) {
		// 	console.log(declaration.getChildrenOfKind(SyntaxKind.SymbolKeyword));
		// }

		// console.log(node.getSymbol().getDeclarations().map(r => r.getType()));

		// const override = Overrides.Variables[node.getName()];
		// if (override) node.replaceWithText(override);

		node.removeInitializer();

		destination.addVariableStatement(node.getVariableStatement().getStructure());
		cache.variables.set(node.getSymbol(), node);
	} else if (Node.isEnumDeclaration(node) && !cache.enums.has(node.getSymbol())) {
		if (removeExports) {
			node.setIsExported(false);
			node.setIsDefaultExport(false);
			node.setHasDeclareKeyword(false);
		}

		destination.addEnum(node.getStructure());
		cache.enums.set(node.getSymbol(), node);
	} else if (Node.isInterfaceDeclaration(node) && !cache.interfaces.has(node.getSymbol())) {
		if (removeExports) {
			node.setIsExported(false);
			node.setIsDefaultExport(false);
			node.setHasDeclareKeyword(false);
		}

		destination.addInterface(node.getStructure());
		cache.interfaces.set(node.getSymbol(), node);
	} else if (Node.isTypeAliasDeclaration(node) && !cache.types.has(node.getSymbol())) {
		if (removeExports) {
			node.setIsExported(false);
			node.setIsDefaultExport(false);
			node.setHasDeclareKeyword(false);
		}

		destination.addTypeAlias(node.getStructure());
		cache.types.set(node.getSymbol(), node);
	} else if (Node.isImportDeclaration(node) && !cache.imports.has(node.getText())) {
		destination.addImportDeclaration(node.getStructure());
		cache.imports.set(node.getText(), node);
	} else if (Node.isModuleDeclaration(node) && !cache.modules.has(node.getSymbol())) {
		if (removeExports) {
			node.setIsExported(false);
			node.setIsDefaultExport(false);
			node.setHasDeclareKeyword(false);
		}

		destination.addModule(node.getStructure());
		cache.modules.set(node.getSymbol(), node);
	}

	// addTypeReferences(node, destination, cache);

	// Classes
	// if (Node.isClassDeclaration(node)) {
	// 	for (const method of node.getInstanceMethods()) {
	// 		method.setIsAsync(false);

	// 		const parameters = method.getParameters();

	// 		for (const parameter of parameters) {
	// 			// Infer a parameter type if it is not already set
	// 			parameter.setType(parameter.getType().getText(parameter));

	// 			// Remove initializers for function parameters and make them optional instead
	// 			if (parameter.hasInitializer()) {
	// 				parameter.setHasQuestionToken(true);
	// 				parameter.removeInitializer();
	// 			}

	// 			// Rename object nodes to options as ambient modules don't support object destructuring
	// 			for (const child of parameter.getChildren()) {
	// 				if (Node.isObjectBindingPattern(child)) {
	// 					child.replaceWithText('options');
	// 				}
	// 			}
	// 		}
	// 	}

	// 	destination.addClass(node.getStructure());

	// 	// addTypeReferences(node, destination, cache);

	// 	cache.classes.set(node.getSymbol(), node);
	// }

	// Class Instances (TODO)
	// if (Node.isNewExpression(node)) {
	// 	const declarations = node.getType().getSymbol().getDeclarations();
	// 	for (const declaration of declarations) {
	// 		if (Node.isClassDeclaration(declaration)) {
	// 			const named = declaration.getName();
	// 			declaration.rename('_' + named);

	// 			for (const method of declaration.getInstanceMethods()) {
	// 				method.setIsAsync(false);

	// 				const parameters = method.getParameters();

	// 				for (const parameter of parameters) {
	// 					// Infer a parameter type if it is not already set
	// 					parameter.setType(parameter.getType().getText(parameter));

	// 					// Remove initializers for function parameters and make them optional instead
	// 					if (parameter.hasInitializer()) {
	// 						parameter.setHasQuestionToken(true);
	// 						parameter.removeInitializer();
	// 					}

	// 					// Rename object nodes to options as ambient modules don't support object destructuring
	// 					for (const child of parameter.getChildren()) {
	// 						if (Node.isObjectBindingPattern(child)) {
	// 							child.replaceWithText('options');
	// 						}
	// 					}
	// 				}
	// 			}

	// 			for (const property of declaration.getProperties()) {
	// 				property.removeInitializer();
	// 			}

	// 			destination.addClass(declaration.getStructure());
	// 			destination.addVariableStatement({
	// 				isExported: true,
	// 				declarationKind: VariableDeclarationKind.Const,
	// 				declarations: [
	// 					{
	// 						name: named,
	// 						type: `InstanceType<typeof _${named}>`
	// 					}
	// 				]
	// 			});

	// 			// cache.classes.set(declaration.getSymbol(), declaration);
	// 			// addTypeReferences(declaration, destination, cache);
	// 		}
	// 	}
	// }
}

export default add;