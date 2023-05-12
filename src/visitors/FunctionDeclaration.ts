import { printSync } from '@swc/core';
const wrapExport = node => ({
  type: 'ExportDeclaration',
  declaration: node,
  span: {
    start: 0,
    end: 0,
    ctxt: 0
  }
});
export default function (data: Visitor & { isExport?: boolean; }) {
  let { node, parent, store, isExport } = data;

  const name = node.identifier.value;
  
  node.declare = false;

  if (Array.isArray(parent) && parent.some(n => n?.type === "ExportDefaultExpression" && (n.expression as any).value === name)) {
    node = wrapExport(node);
  }

  (isExport ? store.exports : store.variables).set(name, {
    kind: node.type,
    _raw: node,
    contents: printSync({
      body: Array.isArray(parent) ? [node] : [parent],
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
