const dynamic = async () => {
  const args = process.argv.slice(2);
  const pluginName = args.at(-1);
  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    console.log(plugin.run());
  } catch (error) {
    console.error(`Plugin not found`);
    process.exit(1);
  }
};

await dynamic();
