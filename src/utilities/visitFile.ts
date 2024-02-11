import { Node, ModuleDeclaration, type SourceFile } from 'ts-morph';
import { add, createCache, getModuleTypeImports, getTypeReferences } from '~/utilities';
import api from '~/projects/api';

function visitFile(file: SourceFile, isDirectory: boolean, moduleOrName: ModuleDeclaration | SourceFile | string, cache?: DeclarationCache) {
	cache ??= createCache();

	const name = moduleOrName instanceof ModuleDeclaration ? moduleOrName.getName() : moduleOrName;
	logger.info(`Processing ${name}...`);

	const module = moduleOrName instanceof ModuleDeclaration ? moduleOrName : api.file.addModule({
		name: `"${name}"`,
		hasDeclareKeyword: true
	});

	const exports = file.getExportedDeclarations();

	for (const [key, declarations] of exports) {
		logger.debug(`Exporting ${key} → ${module.getName()}`);

		// Everything is re-exported as default globally
		if (key === 'default') continue;


		for (const declaration of declarations) {
			if (isDirectory && Node.isSourceFile(declaration)) {
				break;
			}

			add(declaration, isDirectory, module, cache);

			const relations = getTypeReferences(declaration, cache);
			for (const relation of relations) {
				add(relation, isDirectory, module, cache);
			}
		}
	}

	const imports = file.getImportDeclarations();
	for (const imp of imports) {
		const nodes = getModuleTypeImports(imp);

		for (const node of nodes) {
			add(node, isDirectory, module, cache);
		}
	}

	logger.success(`Processed ${name}.`);
}

export default visitFile;