import { ModuleDeclarationKind, Node, SourceFile, ExportDeclaration, FunctionDeclarationStructure } from 'ts-morph';
import { createExportMap } from '@util/mapper';
import Output from '@instances/output';
import cli from '@instances/cli';

export function resolveExportTypes(source: SourceFile) {
  for (const [name, declaration] of createExportMap(source)) {
    const id = `@enmity/${name}`;

    const mdl = Output.file.addModule({
      name: `"${id}"`,
      declarationKind: ModuleDeclarationKind.Module,
      hasDeclareKeyword: true
    });

    function traverseExports(node: ExportDeclaration) {
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

          // Remove unused typings

          if (cli.flags.unused && Node.isReferenceFindable(value)) {
            const refs = value.findReferencesAsNodes();
            if (refs.length < 1) continue;
          }

          if (Node.isEnumDeclaration(value)) {
            const struct = value.getStructure();

            struct.isConst = true;
            struct.hasDeclareKeyword = false;
            struct.isExported = true;

            mdl.addEnum(struct);
          } else if (Node.isFunctionDeclaration(value)) {
            const struct = value.getStructure() as FunctionDeclarationStructure;

            // Delete function argument initializers & make argument optional as it has an initializer
            struct.parameters.map(e => e.initializer && delete e.initializer && (e.hasQuestionToken = true));
            struct.isExported = true;

            mdl.addFunction(struct);
          } else if (Node.isVariableDeclaration(value)) {
            const structure = value.getStructure();
            const statement = value.getVariableStatement();
            if (!statement) return;
            // mdl.addStatements(statement.getStructure());
            // console.log(value.getStructure());
            console.log(value.getVariableStatement().forEachChild(console.log));
          } else if (Node.isTypeLiteral(value)) {

          } else if (Node.isInterfaceDeclaration(value)) {
            const structure = value.getStructure();

            structure.isExported = true;

            mdl.addInterface(structure);
          } else if (Node.isTypeAliasDeclaration(value)) {
            const structure = value.getStructure();

            structure.isExported = true;

            mdl.addTypeAlias(structure);
          }
        }
      }
    }

    traverseExports(declaration);

    mdl.addExportDeclaration({
      namespaceExport: 'default',
      moduleSpecifier: id
    });
  }
}