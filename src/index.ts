import { parseSync, printSync } from '@swc/core';
import createModule from '@util/createModule';
import cli from '@instances/cli';
import visit from '@util/visit';
import path from 'path';
import fs from 'fs';

import('./setup');

console.clear();

const file = path.resolve(process.cwd(), cli._.api);
console.info(file);

if (!fs.existsSync(file)) {
	throw new Error('Could not resolve provided path');
} else {
	let out = '';
	const result = visit(file);
	out += Array.from<any>(result.types.values()).map(val => val.contents.code).join('\n');

	let entries = [];
	let seen = new Set();

	const traverse = (node) => {
		if (node.code) {
			return entries.push(node.code);
		}

		for (let [name, value] of node.variables.entries()) {
			if (!value?.include) continue;
			if (seen.has(name)) continue;
			if (value.imports) {

				for (const [_name, _import] of value.imports.entries()) {
					if (seen.has(_name)) continue;
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
								type: "Module"
							}).code
						);
						seen.add(_name);
					} catch (error) {
						console.warn(error, _import);
					}
				}
			}

			if (value.type === "ImportDeclaration") {
				value = value.contents;
			}

			seen.add(name);
			entries.push(value?.contents?.code);
		}

		for (const [name, value] of node.exports.entries()) {
			if (!value.contents) {
				console.warn({ name, value, node });
			} else if (!seen.has(name)) {
				seen.add(name);
				entries.push(value.contents.code);
			}
		}
	};

	out += Array.from<any>(result.exports.entries()).map(([name, _export]) => {
		traverse(_export.contents);

		const res = createModule({
			entries: entries,
			name: '@unbound/' + name
		});

		seen = new Set();
		entries = [];

		return res;
	}).join('\n');

	try {
		out = 'import React from "react"\n\n' + printSync(parseSync(out, { syntax: 'typescript' }))?.code;
		fs.writeFileSync(path.resolve(process.cwd(), 'output.d.ts'), out, 'utf-8');
	} catch (error) {
		console.error(error);
	}
}

setInterval(() => { }, 1000);
