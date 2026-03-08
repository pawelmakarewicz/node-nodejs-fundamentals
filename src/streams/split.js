import { Writable, Transform } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

const split = async () => {
  const linesIndex = process.argv.findIndex(arg => arg === '--lines') + 1;
  const N = linesIndex ? Number(process.argv[linesIndex]) || 10 : 10;

  const sourcePath = join(__dirname, 'source.txt');

  const lineSplitter = new Transform({
    readableObjectMode: true,

    transform(chunk, enc, cb) {
      this._buf = (this._buf || '') + chunk.toString();
      const parts = this._buf.split('\n');
      this._buf = parts.pop();
      for (const line of parts) this.push(line);
      cb();
    },

    flush(cb) {
      if (this._buf) this.push(this._buf);
      cb();
    },
  });

  let fileIndex = 1;
  let lineCount = 0;
  let outStream = createWriteStream(join(__dirname, `chunk_${fileIndex}.txt`));

  const writer = new Writable({
    objectMode: true,

    write(line, enc, cb) {
      if (lineCount >= N) {
        outStream.end();
        fileIndex++;
        lineCount = 0;
        outStream = createWriteStream(join(__dirname, `chunk_${fileIndex}.txt`));
      }

      const prefix = lineCount > 0 ? '\n' : '';
      lineCount++;

      if (!outStream.write(prefix + line)) {
        outStream.once('drain', cb);
      } else {
        cb();
      }
    },

    final(cb) {
      outStream.end(cb);
    },
  });

  await pipeline(createReadStream(sourcePath, 'utf-8'), lineSplitter, writer);

  console.log(`Split into ${fileIndex} chunk(s), ${N} lines each.`);
};

await split();
