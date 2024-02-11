import type {
	ExportDeclaration,
	ExportedDeclarations,
	FunctionDeclarationStructure,
	ImportDeclaration,
	ModuleDeclaration,
	ObjectLiteralElement,
	SourceFile,
	VariableDeclaration,
} from 'ts-morph';
import { getModuleTypeImports, getTypeReferences } from '~/utilities';
import { Overrides } from '~/constants';
import { Node } from 'ts-morph';

function add(node: ImportDeclaration | ExportedDeclarations | ExportDeclaration, isDirectory: boolean, destination: ModuleDeclaration | SourceFile, cache: DeclarationCache) {
	if (isDirectory && Node.isSourceFile(node)) return;
	const file = node.getSourceFile();

	if (Node.isFunctionDeclaration(node) && !cache.functions.has(node.getSymbol())) {
		// Infer a return value type if it is not already set
		node.setReturnType(node.getReturnType().getText(node));

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

		node.setIsExported(true);
		node.setIsDefaultExport(false);

		destination.addFunction(node.getStructure() as FunctionDeclarationStructure);
		cache.functions.set(node.getSymbol(), node);
	} else if (Node.isVariableDeclaration(node) && !cache.variables.has(node.getSymbol())) {
		node.setType(node.getType().getText(node));

		const override = Overrides.Variables[node.getName()];
		if (override) node.replaceWithText(override);

		node.removeInitializer();

		destination.addVariableStatement(node.getVariableStatement().getStructure());
		cache.variables.set(node.getSymbol(), node);
	} else if (Node.isEnumDeclaration(node) && !cache.enums.has(node.getSymbol())) {
		destination.addEnum(node.getStructure());
		cache.enums.set(node.getSymbol(), node);
	} else if (Node.isInterfaceDeclaration(node) && !cache.interfaces.has(node.getSymbol())) {
		destination.addInterface(node.getStructure());
		cache.interfaces.set(node.getSymbol(), node);
	} else if (Node.isTypeAliasDeclaration(node) && !cache.types.has(node.getSymbol())) {
		destination.addTypeAlias(node.getStructure());
		cache.types.set(node.getSymbol(), node);
	} else if (Node.isImportDeclaration(node) && !cache.imports.has(node.getSymbol())) {
		destination.addImportDeclaration(node.getStructure());
		cache.imports.set(node.getSymbol(), node);
	} else if (Node.isModuleDeclaration(node) && !cache.modules.has(node.getSymbol())) {
		destination.addModule(node.getStructure());
		cache.modules.set(node.getSymbol(), node);
	} else if (Node.isObjectLiteralExpression(node)) {
		const properties = node.getProperties();

		for (const property of properties) {
			// @ts-ignore
			const symbol = (property as ObjectLiteralElement).getValueSymbol?.();
			const value = symbol?.getValueDeclaration?.() as VariableDeclaration;

			const references = getTypeReferences(value, cache);
			console.log(references.map(r => r.getText()));

			if (value) {
				// console.log(value);
				add(value, isDirectory, destination, cache);
			}
		}
	} else if (Node.isBindingElement(node)) {
		// TODO
	}

	const imps = file.getImportDeclarations();

	for (const imp of imps) {
		const nodes = getModuleTypeImports(imp);

		for (const node of nodes) {
			if (cache.imports.has(node.getSymbol())) continue;
			add(node, isDirectory, destination, cache);
		}
	}

	const extras = getTypeReferences(node, cache);
	for (const extra of extras) {
		add(extra, isDirectory, destination, cache);
	}
}

export default add;