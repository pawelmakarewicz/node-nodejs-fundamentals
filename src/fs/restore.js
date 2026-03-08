import { promises as fs } from 'fs';
import path from 'path';

const restore = async () => {
  const snapshotPath = path.join(process.cwd(), 'snapshot.json');
  const restorePath = path.join(process.cwd(), 'workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restorePath);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.message !== 'FS operation failed') {
      // Directory doesn't exist, that's what we want
    } else {
      throw error;
    }
  }

  const snapshotContent = await fs.readFile(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(snapshotContent);

  // Create workspace_restored directory
  await fs.mkdir(restorePath, { recursive: true });

  // Recreate directory/file structure
  for (const entry of snapshot.entries) {
    const entryPath = path.join(restorePath, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(entryPath, { recursive: true });
    } else if (entry.type === 'file') {
      const decodedContent = Buffer.from(entry.content, 'base64');
      await fs.writeFile(entryPath, decodedContent);
    }
  }
};

await restore().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
