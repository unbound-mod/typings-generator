import { add, appendTypesToNode, createCache, getFilesRecursively, getTypeReferences, visitFile } from '~/utilities';
import { Node, ModuleDeclarationKind, StructureKind } from 'ts-morph';
import { existsSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, sep } from 'path';
import { createLogger } from '~/instances/logger';
import utilities from '~/projects/utilities';
import sourcemaps from 'source-map-support';
import unbound from '~/projects/unbound';
import globals from '~/projects/global';
import { saveAll } from '~/projects';
import { Regex } from '~/constants';
import cli from '~/instances/cli';
import api from '~/projects/api';

sourcemaps.install();
global.logger = createLogger('Generator');

const entry = join(cli._.root, 'src', 'api', 'index.ts');
if (!existsSync(entry)) {
	logger.error('The provided file does not exist.');
	process.exit(-1);
}

const directory = dirname(entry);
const files = readdirSync(directory);
const apis = files.filter(api => !api.match(Regex.NOT_INDEX));

for (const api of apis) {
	const path = join(directory, api);
	const isDirectory = statSync(path).isDirectory();
	const files = isDirectory ? getFilesRecursively(path) : [path];

	for (const submodule of files) {
		const file = unbound.instance.getSourceFile(submodule);
		const module = relative(directory, submodule);

		const name = '@unbound/' + module
			.split(sep)
			.filter(s => !s.match(Regex.NOT_INDEX))
			.join('/')
			.replace(Regex.EXTENSIONS, '');

		if (file) {
			visitFile(file, isDirectory, name);
		} else {
			console.error(`Couldn't find file ${path}`);
		}
	}
}


// Add globals
const globalsSource = unbound.instance.getSourceFile('global.d.ts');
const utilitiesSource = unbound.instance.getSourceFile('utils.d.ts');

const mdl = globalsSource.getModule('global');
if (mdl) {
	const cache = createCache();

	const body = mdl.getBody();
	const stack = [mdl, ...body.getChildren()];

	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		if (Node.isModuleDeclaration(node)) {
			const locals = node.getLocals();

			const unbound = locals.find(l => l.getName() === 'unbound');
			if (!unbound) {
				logger.error('Failed to find local unbound property in global declaration.');
				break;
			}

			const declarations = unbound.getDeclarations();

			for (const declaration of declarations) {
				const children = declaration.getChildren();
				const type = children?.find(c => c.getKindName() === 'IntersectionType');

				if (!type) {
					logger.error('Failed to find intersection type in unbound property value!');
					break;
				}

				const original = type.getText();
				const modified = original.replace('@api', '@unbound');

				type.replaceWithText(modified);
				break;
			}
		}

		const children = node.getChildren() ?? [];
		stack.push(...children);
	}

	globals.file.addModule(mdl.getStructure());

	const references = getTypeReferences(mdl, cache);
	for (const reference of references) {
		add(reference, false, globals.file, cache);
	}
}

appendTypesToNode(globalsSource, globals.file, 'hasDeclareKeyword');
appendTypesToNode(utilitiesSource, utilities.file, 'hasDeclareKeyword');

const module = api.file.addModule({
	name: '"@unbound"',
	declarationKind: ModuleDeclarationKind.Module,
	hasDeclareKeyword: true
});

for (const mdl of api.file.getModules()) {
	const name = mdl.compilerNode.name.text;
	if (!name.startsWith('@unbound/')) continue;

	const submodule = name.split('/');
	if (submodule.length > 2) continue;

	module.addExportDeclaration({
		kind: StructureKind.ExportDeclaration,
		namespaceExport: submodule[1],
		moduleSpecifier: name
	});
}

module.addExportDeclaration({
	namespaceExport: 'default',
	moduleSpecifier: '@unbound'
});

globals.file.addExportDeclaration({});

logger.info('Emitting typings...');
saveAll();
logger.success('Emitted typings.');