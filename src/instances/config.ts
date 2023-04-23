import cli from '@instances/cli';
import path from 'path';
import fs from 'fs';

const file = path.resolve(process.cwd(), cli._.root, '..', 'tsconfig.json');
const contents = fs.readFileSync(file, 'utf-8');
const config = JSON.parse(contents);

config.compilerOptions.paths['@typings/*'] = ['../../types/*'];

export default config;
