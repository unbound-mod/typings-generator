
import { resolveExportTypes } from '@util/resolver';
import Output from '@instances/output';
import Input from '@instances/input';

resolveExportTypes(Input.file);

Output.file.saveSync();

/* Make app hang to inspect in chrome debugger */

// setInterval(() => { }, 1000);