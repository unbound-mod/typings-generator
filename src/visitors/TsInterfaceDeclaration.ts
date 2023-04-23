import { printSync } from '@swc/core';

export default function (data: Visitor) {
  const { node, parent, store } = data;

  if (Array.isArray(parent)) return;

  store.types.set(node.id.value, {
    _raw: node,
    kind: node.type,
    contents: printSync({
      body: [parent],
      type: 'Module',
      interpreter: null,
      span: {
        start: 0,
        end: node.span.end - node.span.start,
        ctxt: node.span.ctxt
      }
    })
  });
}
