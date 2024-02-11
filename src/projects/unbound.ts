import { ModuleResolutionKind, Project } from 'ts-morph';
import cli from '~/instances/cli';
import { join } from 'path';

export const path = join(cli._.root, 'tsconfig.json');

export const instance = new Project({
	tsConfigFilePath: path,
	compilerOptions: {
		moduleResolution: ModuleResolutionKind.NodeNext
	},
});

instance.addSourceFilesFromTsConfig(path);

export default { instance, path };