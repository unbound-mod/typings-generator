import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getFilesRecursively(path: string) {
	const result = [];

	const stack = readdirSync(path);

	while (stack.length) {
		const file = stack.shift();
		const submodule = join(path, file);

		if (statSync(submodule).isDirectory()) {
			stack.push(submodule);
		} else {
			result.push(submodule);
		}
	}

	return result;
}

export default getFilesRecursively;