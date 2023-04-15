import { ModuleDeclarationKind, SourceFile, ExportDeclaration } from 'ts-morph';
import { createExportMap } from '@util/mapper';
import Output from '@instances/output';

export function resolveExportTypes(source: SourceFile) {
  for (const [name, declaration] of createExportMap(source)) {
    const id = `@enmity/${name}`;

    const mdl = Output.file.addModule({
      name: `"${id}"`,
      declarationKind: ModuleDeclarationKind.Module,
      hasDeclareKeyword: true
    });

    mdl.addExportDeclaration({
      namespaceExport: 'default',
      moduleSpecifier: id
    });

    function traverse(node: ExportDeclaration) {
      const file = node.getModuleSpecifierSourceFile();

      if (file.isInNodeModules()) {
        /* handle node module @types packages */
      }

      if (name === 'default') {
        const symbol = file.getDefaultExportSymbol();
        // console.log(symbol.getDeclarations());
        // for(const declaration of symbol.getDeclarations()) {

        // }
      } else {
        const symbols = file.getExportSymbols();

        for (const symbol of symbols) {
          const value = symbol.getValueDeclaration();
          if (!value) continue;

          switch (value.getKindName()) {
            case 'FunctionDeclaration':
            // console.log('Function');
            // console.log((value as FunctionDeclaration).getType());
            // value.getAncestors();
            // console.log(value.forEachDescendant(n => console.log(n.getType().getText())));
            case 'VariableDeclaration':
            // console.log(value.getType().getText());
            default:
              console.log(value.getKindName());
          }
        }
        // console.log(exported.map(e => e.getValueDeclaration()?.getType().getText()));
        // console.log('Named:', file.getExportSymbols().map(e => e.getDeclarations().map(e => e.getType().getText())).flat());
      }
    }

    traverse(declaration);
  }
}