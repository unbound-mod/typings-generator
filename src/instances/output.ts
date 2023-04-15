import { Project, SourceFile } from 'ts-morph';

class Output extends Project {
  public file: SourceFile;

  constructor() {
    super({
      compilerOptions: {
        outFile: 'output.d.ts'
      }
    });

    this.file = this.createSourceFile('output.d.ts', '', { overwrite: true });
  }
}

export default new Output();