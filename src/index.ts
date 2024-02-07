import '@total-typescript/ts-reset';

import morph, { ModuleResolutionKind, SyntaxKind, Node, ModuleDeclarationKind, StructureKind } from 'ts-morph';
import { createLogger } from '~/structures/logger';
import { existsSync, mkdirSync } from 'fs';
import { file } from '~/instances/config';
import cli from '~/instances/cli';
import path from 'path';

const Logger = createLogger('Generator');

const folder = path.join(__dirname, '..', 'types');
if (!existsSync(folder)) mkdirSync(folder);

const project = new morph.Project({
	tsConfigFilePath: file,
	compilerOptions: {
		moduleResolution: ModuleResolutionKind.NodeNext
	},
});

const output = new morph.Project({
	compilerOptions: {
		declaration: true,
		emitDeclarationOnly: true,
		outFile: path.join(folder, 'api.d.ts')
	}
});

const globals = new morph.Project({
	compilerOptions: {
		declaration: true,
		emitDeclarationOnly: true,
		outFile: path.join(folder, 'globals.d.ts')
	}
});

const utilities = new morph.Project({
	compilerOptions: {
		declaration: true,
		emitDeclarationOnly: true,
		outFile: path.join(folder, 'utilities.d.ts')
	}
});

project.addSourceFilesFromTsConfig(file);

const utilitiesFile = output.createSourceFile(path.join(folder, 'utilities.d.ts'), '', { overwrite: true });
const globalsFile = output.createSourceFile(path.join(folder, 'globals.d.ts'), '', { overwrite: true });
const outputFile = output.createSourceFile(path.join(folder, 'api.d.ts'), '', { overwrite: true });
const api = project.getSourceFile(cli._.root);

function handleFile(file: morph.SourceFile) {
	const exports = file.getExportedDeclarations();

	for (const [name, exp] of exports) {
		const id = `@unbound/${name}`;
		const module = outputFile.addModule({
			name: `"${id}"`,
			declarationKind: ModuleDeclarationKind.Module,
			hasDeclareKeyword: true,
		});

		Logger.warn(`Traversing module ${id}`);

		for (const node of exp) {
			if (node.getKind() === SyntaxKind.SourceFile) {
				const file = node.getSourceFile();
				const symbols = file.getExportedDeclarations();

				for (const [name, declarations] of symbols) {
					Logger.info(`Traversing ${id} -> ${name}`);

					function handlePayload(decl: morph.Node) {
						if (Node.isFunctionDeclaration(decl)) {
							// Infer a return value type if it is not already set
							decl.setReturnType(decl.getReturnType().getText(decl));

							// Async anotation is not allowed in ambient modules
							decl.setIsAsync(false);

							// Remove function source
							decl.removeBody();

							const parameters = decl.getParameters();

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

							decl.setIsExported(true);
							decl.setIsDefaultExport(false);


							module.addFunction(decl.getStructure() as morph.FunctionDeclarationStructure);
						} else if (Node.isVariableDeclaration(decl)) {
							decl.setType(decl.getType().getText(decl));
							decl.removeInitializer();

							module.addVariableStatement(decl.getVariableStatement().getStructure());
						} else if (Node.isEnumDeclaration(decl)) {
							module.addEnum(decl.getStructure());
						} else if (Node.isInterfaceDeclaration(decl)) {
							module.addInterface(decl.getStructure());
						} else {
							Logger.warn(decl.getKindName(), decl.getText());
						}
					}

					if (name === 'default') {
						continue;
					}

					for (const decl of declarations) {
						handlePayload(decl);
					}
				}
			}
		}

		module.addExportDeclaration({
			namespaceExport: 'default',
			moduleSpecifier: id
		});

		Logger.success(`Finished traversing module ${id}`);
	}
}

handleFile(api);

// Add globals
const globalsSource = project.getSourceFile('global.d.ts');
const utilitiesSource = project.getSourceFile('utils.d.ts');


const mdl = globalsSource.getModule('global');
if (mdl) globalsFile.addModule(mdl.getStructure());

const interfaces = utilitiesSource.getInterfaces();
for (const interfc of interfaces) {
	if (interfc.hasDeclareKeyword()) {
		utilitiesFile.addInterface(interfc.getStructure());
	}
}

const types = utilitiesSource.getTypeAliases();
for (const type of types) {
	if (type.hasDeclareKeyword()) {
		utilitiesFile.addTypeAlias(type.getStructure());
	}
}

const module = outputFile.addModule({
	name: '"@unbound"',
	declarationKind: ModuleDeclarationKind.Module,
	hasDeclareKeyword: true
});

for (const mdl of outputFile.getModules()) {
	const name = mdl.compilerNode.name.text;
	if (!name.startsWith('@unbound/')) continue;

	const [, sub] = name.split('/');

	module.addExportDeclaration({
		kind: StructureKind.ExportDeclaration,
		namespaceExport: sub,
		moduleSpecifier: name
	});
}

module.addExportDeclaration({
	namespaceExport: 'default',
	moduleSpecifier: '@unbound'
});

globalsFile.addExportDeclaration({});


output.save();
globals.save();
utilities.save();
Logger.log('Emitted.');

// Keep process awake to be able to inspect it in Chrome DevTools
setInterval(() => { }, 5000);