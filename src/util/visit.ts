import { parseSync } from '@swc/core';
import cache from '@instances/cache';
import Visitors from '@visitors';
import path from 'path';
import fs from 'fs';

const types = new Map();

function visit(file: string, parentStore?: any) {
  if (cache.has(file)) {
    return cache.get(file);
  }

  const dir = path.dirname(file);
  const content = fs.readFileSync(file, 'utf8');

  const ast = parseSync(content, { syntax: 'typescript' });
  const store = { variables: new Map(), exports: new Map(), types };

  cache.set(file, store);

  for (const node of ast.body) {
    const handler = Visitors[node.type];
    if (!handler) {
      /variable|class/i.test(node.type) && console.warn(`Couldn't handle ${node.type}`, node);
      continue;
    }

    try {
      Visitors[node.type]({ node, dir, store, parent: ast.body, parentStore } as Visitor);
    } catch (error) {
      console.error(`Failed to visit node of type ${node.type}.`, node, error);
    }
  }

  return store;
}

export default visit;
