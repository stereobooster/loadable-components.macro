# loadable-components.macro

[![Build Status](https://travis-ci.org/stereobooster/loadable-components.macro.svg?branch=master)](https://travis-ci.org/stereobooster/loadable-components.macro) [![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

## Usage

Similar to dynamic `import` call:

```js
import loadableImport from "loadable-components.macro";
import loadable from "loadable-components";

const AsyncComponent = loadable(() => loadableImport("./MyComponent"));
```

## Credits

Based on [pveyes/raw.macro](https://github.com/pveyes/raw.macro).

## License

MIT
