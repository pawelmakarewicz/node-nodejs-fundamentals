import { promises as fs } from 'fs';
import path from 'path';

async function findFilesByExtension(dirPath, extension, relativePath = '') {
  const files = [];
  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relPath = path.join(relativePath, item);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await findFilesByExtension(fullPath, extension, relPath);
      files.push(...subFiles);
    } else if (stats.isFile()) {
      if (item.endsWith(extension)) {
        files.push(relPath);
      }
    }
  }

  return files;
}

const findByExt = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');

  try {
    await fs.access(workspacePath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const args = process.argv.slice(2);
  let extension = '.txt';

  const extIndex = args.indexOf('--ext');
  if (extIndex !== -1 && args[extIndex + 1]) {
    extension = args[extIndex + 1].startsWith('.')
      ? args[extIndex + 1]
      : `.${args[extIndex + 1]}`;
  }

  const files = await findFilesByExtension(workspacePath, extension);
  files.sort();

  for (const file of files) {
    console.log(file);
  }
};

await findByExt().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
