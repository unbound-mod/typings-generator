import config from '@instances/config';
import cli from '@instances/cli';
import { existsSync } from 'fs';
import path from 'path';

export function buildPath(...parts: string[]) {
  const { compilerOptions: { baseUrl } } = config;
  let file = path.resolve(process.cwd(), cli._.root, baseUrl ?? '.', ...parts).replace('.ts', '.d.ts');

  try {
    file = file + (Object.keys(require.extensions).find(ext => existsSync(file + ext)) ?? '');
    return require.resolve(file);
  } catch (error) {
    console.error(error, { file, parts });
    throw error;
  }
};

export function resolvePath(location: string, dir: string) {
  const { compilerOptions: { paths } } = config;

  if (paths[location]) {
    return buildPath(paths[location][0]);
  }

  if (location.indexOf('./') === 0 || location.indexOf('../') === 0) {
    return buildPath(dir, location);
  }

  for (const part in paths) {
    if (location.indexOf(part.slice(0, -1)) === 0) {
      const full = paths[part][0].replace('*', location.replace(part.slice(0, -2), ''));
      return buildPath(full);
    }
  }

  console.warn(`Couldn't find ${location}`, Object.keys(paths));
}
