import { resolvePath } from '@util/path';
import visit from '@util/visit';
import { extname } from 'path';

// TODO: Make JSON types

export default function (data: Visitor) {
  const { node, store, dir } = data;
  const path = resolvePath(node.source.value, dir);
  const contents = extname(path) !== '.json' ? visit(path, store) : null;

  for (const spec of node.specifiers) {
    const kind = spec.type;

    // console.log(spec.local.value, spec);

    store.variables.set(spec.local.value, {
      _raw: spec,
      kind,
      type: node.type,
      namespace: node.source.value,
      contents: extname(path) === '.json'
        ? null
        : contents.exports.get(kind === 'ImportDefaultSpecifier'
          ? 'default'
          : spec.local.value)
    });
  }
}
