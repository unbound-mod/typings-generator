import cli from '~/instances/cli';
import path from 'path';
import fs from 'fs';

export const file = path.resolve(cli._.root, '..', '..', '..', 'tsconfig.json');
const contents = fs.readFileSync(file, 'utf-8');
const config = JSON.parse(contents);

export default config as any;
