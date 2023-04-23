import { printSync } from '@swc/core';

export default function (data: Visitor & { isExport?: boolean; }) {
  const { node, parent, store, isExport } = data;

  // console.log(dat)

  node.declare = false;

  (isExport ? store.exports : store.variables).set(node.identifier.value, {
    kind: node.type,
    _raw: node,
    contents: printSync({
      body: Array.isArray(parent) ? [parent.find(e => e.type === 'FunctionDeclaration')] : [parent],
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
