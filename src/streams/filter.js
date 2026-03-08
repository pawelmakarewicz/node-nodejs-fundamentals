import { Transform } from 'node:stream';

const filter = () => {
  const patternIndex = process.argv.findIndex(arg => arg === '--pattern') + 1;
  const pattern = process.argv[patternIndex];
  const regex = new RegExp(pattern);

  let buffer = '';

  const transform = new Transform({
    transform(chunk, enc, cb) {
      
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      const filtered = lines
        .filter(line => regex.test(line))
        .join('\n');

      if (filtered) cb(null, filtered + '\n');
      else cb();
    },

    flush(cb) {
      if (buffer && regex.test(buffer)) cb(null, buffer + '\n');
      else cb();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();
