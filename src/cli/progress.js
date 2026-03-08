const args = process.argv.slice(2);

const RESET = '\x1b[0m';

const getArg = (name) => {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return undefined;
  return args[index + 1];
};

const getNumericArg = (name, defaultValue) => {
  const raw = getArg(name);
  if (raw === undefined) return defaultValue;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const parseHexColor = (hex) => {
  if (!hex) return null;
  const match = hex.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!match) return null;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  return `\x1b[38;2;${r};${g};${b}m`;
};

const renderBar = (percent, length, colorCode) => {
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;

  const filledBar = '█'.repeat(filled);
  const emptyBar = ' '.repeat(empty);

  const coloredFilled = colorCode ? `${colorCode}${filledBar}${RESET}` : filledBar;
  return `[${coloredFilled}${emptyBar}] ${percent}%`;
};

const progress = () => {
  const duration = getNumericArg('--duration', 5000);
  const interval = getNumericArg('--interval', 100);
  const length = getNumericArg('--length', 30);
  const colorCode = parseHexColor(getArg('--color'));

  const totalSteps = Math.ceil(duration / interval);
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const percent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

    process.stdout.write(`\r${renderBar(percent, length, colorCode)}`);

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
