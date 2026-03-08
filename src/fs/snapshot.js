import { promises as fs } from 'fs';
import path from 'path';

async function scanDirectory(dirPath, relativePath = '') {
  try {
    const entries = [];
    const items = await fs.readdir(dirPath);
    items.sort();

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relPath = path.join(relativePath, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        entries.push({ path: relPath, type: 'directory' });
        const subEntries = await scanDirectory(fullPath, relPath);
        entries.push(...subEntries);
      } else if (stats.isFile()) {
        const buffer = await fs.readFile(fullPath);
        entries.push({
          path: relPath,
          type: 'file',
          size: stats.size,
          content: buffer.toString('base64'),
        });
      }
    }

    return entries;
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }
}

const snapshot = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  try {
    await fs.access(workspacePath);
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }

  const entries = await scanDirectory(workspacePath);

  const result = {
    rootPath: workspacePath,
    entries,
  };

  const snapshotPath = path.join(path.dirname(workspacePath), 'snapshot.json');
  try {
    await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }
};

await snapshot().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
