import { add, appendTypesToNode, createCache, addTypeReferences, isPrivate } from '~/utilities';
import { ModuleDeclarationKind, Node, StructureKind } from 'ts-morph';
import { API, Global, saveAll, Unbound, Utilities } from '~/projects';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createLogger } from '~/instances/logger';
import sourcemaps from 'source-map-support';
import { TypesFolder } from '~/constants';
import { join, resolve } from 'path';
import cli from '~/instances/cli';

sourcemaps.install();
global.logger = createLogger('Generator');

const packagePath = join(cli._.root, 'package.json');
if (!existsSync(packagePath)) {
	logger.error('Provided path does not have package.json at the top-level. This is needed to fetch the version of the typings.');
	process.exit(-1);
}

const packageContent = readFileSync(packagePath, 'utf-8');
const client = JSON.parse(packageContent);

if (!client.version) {
	logger.error('The "version" field in package.json should not be empty.');
	process.exit(-1);
}

const entry = join(cli._.root, 'src', 'api', 'index.ts');
if (!existsSync(entry)) {
	logger.error('The provided file does not exist.');
	process.exit(-1);
}

const api = Unbound.instance.addSourceFileAtPath(entry);

global.moduleMap = new Map<string, ModuleEntry>();

for (const [name, exported] of api.getExportedDeclarations().entries()) {
	const [file] = exported;


	const sourceFile = file.getSourceFile();

	const entry: ModuleEntry = {
		sourceFile,
		name,
		path: sourceFile.getFilePath(),
		referencedFiles: new Set(),
		exported: new Map(),
		imports: new Map(),
	};

	global.moduleMap.set(name, entry);
}


const stack = [...global.moduleMap.entries()];
// Get sub-exports
while (stack.length) {
	const [name, mdl] = stack.shift();

	for (const [expName, exps] of mdl.sourceFile.getExportedDeclarations()) {
		const [exp] = exps;

		if (Node.isSourceFile(exp)) {
			const newName = `${name}/${expName}`;

			mdl.referencedFiles.add(exp.getFilePath());

			const data: ModuleEntry = {
				exported: new Map(),
				imports: new Map(),
				referencedFiles: new Set(),
				path: exp.getFilePath(),
				name: newName,
				sourceFile: exp
			};

			global.moduleMap.set(newName, data);

			stack.push([newName, data]);
		}
	}
}


const moduleMapStack = [...global.moduleMap.entries()];
while (moduleMapStack.length) {
	const [name, mdl] = moduleMapStack.shift();

	for (const referenced of mdl.sourceFile.getReferencedSourceFiles()) {
		if (referenced.isInNodeModules()) continue;

		mdl.referencedFiles.add(referenced.getFilePath());
	}

	for (const [expName, exps] of mdl.sourceFile.getExportedDeclarations()) {
		const [node] = exps;

		// Don't export internal @private methods.
		if (Node.isJSDocable(node) && !isPrivate(node)) {
			continue;
		}

		if (!Node.isSourceFile(node)) {
			mdl.exported.set(expName, node);
		} else {
			const newName = `${name}/${expName}`;

			const data: ModuleEntry = {
				exported: new Map(),
				imports: new Map(),
				referencedFiles: new Set(),
				path: node.getFilePath(),
				name: newName,
				sourceFile: node
			};

			global.moduleMap.set(newName, data);

			moduleMapStack.push([newName, data]);
		}
	};
}


for (const [name, mdl] of global.moduleMap.entries()) {
	const module = API.file.addModule({
		name: `"@unbound/${name}"`,
		declarationKind: ModuleDeclarationKind.Module,
		hasDeclareKeyword: true
	});

	const cache = createCache();

	for (const [expName, exp] of mdl.exported) {
		logger.debug(`Exporting @unbound/${name} → ${expName}`);

		add(exp, module, cache);
	}

	for (const child of mdl.exported.values()) {
		addTypeReferences(child, module, cache);
	}
};


const mainModule = API.file.addModule({
	name: '"@unbound"',
	declarationKind: ModuleDeclarationKind.Module,
	hasDeclareKeyword: true
});

for (const mdl of API.file.getModules()) {
	const name = mdl.compilerNode.name.text;
	if (!name.startsWith('@unbound/')) continue;

	const submodule = name.split('/');
	if (submodule.length > 2) continue;

	// if(Node.isJSDocable(node) && !shouldExport(node)) return;

	mainModule.addExportDeclaration({
		kind: StructureKind.ExportDeclaration,
		namespaceExport: submodule[1],
		moduleSpecifier: name
	});
}

mainModule.addExportDeclaration({
	namespaceExport: 'default',
	moduleSpecifier: '@unbound'
});

saveAll();

// Add globals
const globalsSource = Unbound.instance.getSourceFile('global.d.ts');
const utilitiesSource = Unbound.instance.getSourceFile('utils.d.ts');

Global.file.addImportDeclaration({
	moduleSpecifier: './utilities'
});

Global.file.addImportDeclaration({
	moduleSpecifier: './api'
});

const mdl = globalsSource.getModule('global');
if (mdl) {
	const cache = createCache();

	const body = mdl.getBody();
	const stack = [mdl, ...body.getChildren()];

	while (stack.length) {
		const node = stack.shift();
		if (!node) continue;

		if (Node.isModuleDeclaration(node)) {
			if (node.getName() != 'global') continue;
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

	Global.file.addModule(mdl.getStructure());
	addTypeReferences(mdl, Global.file, cache);
}

appendTypesToNode(globalsSource, Global.file, 'hasDeclareKeyword');
appendTypesToNode(utilitiesSource, Utilities.file, 'hasDeclareKeyword');

Global.file.addExportDeclaration({});

logger.info('Emitting typings...');

saveAll();

{
	const presetPackagePath = resolve(TypesFolder, '_package.json');
	const packagePath = resolve(TypesFolder, 'package.json');
	const content = require(presetPackagePath);

	content.version = client.version;
	writeFileSync(packagePath, JSON.stringify(content, null, 2), 'utf-8');
}

logger.success('Emitted typings.');