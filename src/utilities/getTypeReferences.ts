import { Node } from 'ts-morph';

function getTypeReferences(node: Node, cache: DeclarationCache) {
	const result = [];
	const stack = [node, ...node.getChildren()];

	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		if (Node.isTypeReference(node)) {
			handleNode(node, result, cache);

			const type = node.getType();
			const symbols = [type?.getAliasSymbol(), type?.getSymbol()].filter(Boolean);

			for (const symbol of symbols) {
				const stack = symbol.getDeclarations();

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

		handleNode(node, result, cache);

		const children = node.getChildren() ?? [];
		stack.push(...children);
	}
}

function handleNode(node: Node, result: Node[], cache: DeclarationCache) {
	const isValidNode = Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isModuleDeclaration(node);
	const isInNodeModules = node.getSourceFile().isInNodeModules();
	const isInCache = cache.references.has(node.getSymbol());

	if (!isValidNode || isInCache || isInNodeModules || node.hasDeclareKeyword()) return;

	result.push(node);
	cache.references.set(node.getSymbol(), node);
}

export default getTypeReferences;