import { Project, SourceFile } from 'ts-morph';
import cli from '@instances/cli';
import path from 'path';

class Input extends Project {
  public file: SourceFile;

  constructor() {
    super({
      tsConfigFilePath: path.resolve(cli._.root, 'tsconfig.json'),
      compilerOptions: {
        outDir: 'out',
        declaration: true,
        emitDeclarationOnly: true
      },
    });

    this.file = this.addSourceFileAtPath(path.join(cli._.root, cli._.api));
  }
}

export default new Input();