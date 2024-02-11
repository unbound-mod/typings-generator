import { TypesFolder } from '~/constants';
import { Project } from 'ts-morph';
import { join } from 'node:path';

export const path = join(TypesFolder, 'utilities.d.ts');

export const instance = new Project({
	compilerOptions: {
		declaration: true,
		emitDeclarationOnly: true,
		outFile: path
	}
});

export const file = instance.createSourceFile(path, '', { overwrite: true });

export default { instance, file, path };