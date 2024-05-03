import { Node } from 'ts-morph';

function getTypeReferences(node: Node, cache: DeclarationCache) {
	const result = [];
	const stack = [node, ...node.getChildren()];

	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;


		if (Node.isTypeReference(node) || Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node) || Node.isModuleBlock(node) || Node.isModuleDeclaration(node) || Node.isVariableDeclaration(node) || Node.isFunctionDeclaration(node) || Node.isTypeQuery(node)) {
			handleNode(stack, node, result, cache);

			const type = node.getType();
			const symbols = [type?.getAliasSymbol(), type?.getSymbol()].filter(Boolean);

			for (const symbol of symbols) {
				const stack = symbol.getDeclarations() ?? [];

				useStack(stack, result, cache);
			}
		}

		stack.push(...node.getChildren());
	}

	return result;
}


function useStack(stack: Node[], result: Node[], cache: DeclarationCache) {
	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		handleNode(stack, node, result, cache);

		stack.push(...node.getChildren());
	}
}

function handleNode(stack: Node[], node: Node, result: Node[], cache: DeclarationCache) {
	if (Node.isFunctionDeclaration(node) && cache.functions.has(node.getSymbol())) {
		return;
	}

	const isValidNode = Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isModuleDeclaration(node) || Node.isFunctionDeclaration(node);
	const isInNodeModules = node.getSourceFile().isInNodeModules();
	const isInCache = cache.references.has(node.getSymbol());

	if (!isValidNode || isInCache || isInNodeModules || node.hasDeclareKeyword?.()) return;

	const block = node.getParent();
	const parent = block?.getParent();

	if (Node.isModuleBlock(block) && Node.isModuleDeclaration(parent) && !cache.references.has(parent?.getSymbol())) {
		const name = parent.getNameNode()?.getText();
		if (name === 'global') return;

		if (parent.hasDeclareKeyword()) {
			parent.setHasDeclareKeyword(false);
		}

		result.push(parent);
		return cache.references.set(parent.getSymbol(), node);
	}

	const isType = Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node);
	if (isType && cache.references.has(parent?.getSymbol())) return;

	result.push(node);
	cache.references.set(node.getSymbol(), node);
}

export default getTypeReferences;