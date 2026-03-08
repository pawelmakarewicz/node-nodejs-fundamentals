import { Transform } from 'node:stream';

const addLineNumbers = (chunk, counter) =>
  chunk
    .toString()
    .split('\n')
    .map((line, i) => {
      if (i === 0 && line === '') return '';
      return `${counter.value++} | ${line}`;
    })
    .join('\n');

const counter = { value: 1 };

const transform = new Transform({
  transform(chunk, enc, cb) {
    cb(null, addLineNumbers(chunk, counter));
  },
});

const lineNumberer = () => {
  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
