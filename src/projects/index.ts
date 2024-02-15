import Utilities from '~/projects/utilities';
import Global from '~/projects/global';
import API from '~/projects/api';

export { default as Utilities } from './utilities';
export { default as Unbound } from './unbound';
export { default as Global } from './global';
export { default as API } from './api';

export function saveAll() {
	Utilities.file.fixUnusedIdentifiers();
	Utilities.file.save();

	Global.file.fixUnusedIdentifiers();
	Global.file.fixMissingImports();
	Global.file.save();

	API.file.fixUnusedIdentifiers();
	API.file.save();
}