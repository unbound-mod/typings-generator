import { Node, SourceFile, ImportDeclaration, ExportDeclaration } from 'ts-morph';

export function createImportMap(source: SourceFile): Map<string, ImportDeclaration> {
  const symbols = new Map();

  for (const imp of source.getImportDeclarations()) {
    imp.forEachDescendant((node) => {
      if (!Node.isIdentifier(node)) return;

      const sym = node.getSymbol();
      if (!sym) return;

      symbols.set(sym.getName(), imp);
    });
  }

  return symbols;
}

export function createExportMap(source: SourceFile): Map<string, ExportDeclaration> {
  const symbols = new Map();

  for (const exp of source.getExportDeclarations()) {
    exp.forEachDescendant((node) => {
      if (!Node.isIdentifier(node)) return;

      const sym = node.getSymbol();
      if (!sym) return;

      symbols.set(sym.getName(), exp);
    });
  }

  return symbols;
}