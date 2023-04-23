import { parseSync, printSync } from '@swc/core';
import createModule from '@util/createModule';
import cli from '@instances/cli';
import visit from '@util/visit';
import path from 'path';
import fs from 'fs';

import './setup';

console.clear();

const file = path.resolve(process.cwd(), cli._.api);

if (!fs.existsSync(file)) {
	throw new Error('Could not resolve provided path');
} else {
	let out = '';
	const result = visit(file);
	console.log('res:', result);
	out += Array.from<any>(result.types.values()).map(val => val.contents.code).join('\n');

	out += Array.from<any>(result.exports.entries()).map(([name, _export]) => {
		const entries = [];
		const traverse = (node) => {
			if (node.code) {
				return entries.push(node.code);
			}

			for (let value of node.variables.values()) {
				if (!value?.include) continue;
				if (value.imports) {
					for (const _import of value.imports.values()) {
						try {
							entries.push(
								printSync({
									body: [_import._raw],
									interpreter: null,
									span: {
										ctxt: 0,
										start: 0,
										end: 0
									},
									type: 'Module'
								}).code
							);
						} catch {
							console.warn(_import);
						}
					}
				}

				if (value.type === 'ImportDeclaration') {
					value = value.contents;
				}

				entries.push(
					value?.contents?.code
				);
			}

			for (const [name, value] of node.exports.entries()) {
				if (!value.contents) {
					console.warn({ name, value, node });
				} else {
					entries.push(value.contents.code);
				}
			}
		};

		traverse(_export.contents);

		return createModule({
			entries,
			name: '@enmity/' + name
		});
	}).join('\n');

	out = 'import React from 'react'\n\n' + printSync(parseSync(out, { syntax: 'typescript' }))?.code;
	fs.writeFileSync(path.resolve(process.cwd(), 'output.d.ts'), out, 'utf-8');
}

setInterval(() => { }, 1000);
