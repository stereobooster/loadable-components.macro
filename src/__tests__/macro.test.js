const path = require("path");
const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");
const prettier = require("prettier");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  formatResult(result) {
    return prettier.format(result, { trailingComma: "es5" });
  },
  tests: {
    "no usage": `import loadableImport from "../macro";`,
    basic: `
      import loadableImport from "../macro";
      import loadable from "loadable-components";

      const AsyncComponent = loadable(() => loadableImport("./MyComponent"));
    `,
    "with options": `
      import loadableImport from "../macro";
      import loadable from "loadable-components";

      const AsyncComponent = loadable(() => loadableImport("./MyComponent"), {
        LoadingComponent: () => "Loading...",
      });
    `,
    "multiple imports": `
      import loadableImport from "../macro";
      import loadable from "loadable-components";

      const What = loadable(async () => {
        const { default: DeepWord } = await loadableImport("./DeepWorld");
        const { default: DeepAmazing } = await loadableImport("./DeepAmazing");
        return [DeepWord, DeepAmazing];
      });
    `,
  },
});
