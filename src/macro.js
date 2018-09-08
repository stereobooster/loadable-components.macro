const { createMacro } = require("babel-plugin-macros");

export default createMacro(loadableComponentsMacros);

function loadableComponentsMacros({ references, state, babel }) {
  references.default.map(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      requireLoadableComponents({ referencePath, state, babel });
    } else {
      throw new Error(
        `This is not supported: \`${referencePath
          .findParent(babel.types.isExpression)
          .getSource()}\`. Please see the loadable-components.macro documentation`,
      );
    }
  });
}

function requireLoadableComponents({ referencePath, state, babel }) {
  const t = babel.types;
  const callExpressionPath = referencePath.parentPath;
  let loadableComponentsPath;

  try {
    loadableComponentsPath = callExpressionPath.get("arguments")[0].evaluate()
      .value;
  } catch (err) {
    // swallow error, print better error below
  }

  if (loadableComponentsPath === undefined) {
    throw new Error(
      `There was a problem evaluating the value of the argument for the code: ${callExpressionPath.getSource()}. ` +
        `If the value is dynamic, please make sure that its value is statically deterministic.`,
    );
  }

  const loadableComponentsPathParts = loadableComponentsPath.split("/");
  const identifier =
    loadableComponentsPathParts[loadableComponentsPathParts.length - 1];

  referencePath.parentPath.replaceWith(
    t.callExpression(t.identifier("import"), [
      t.stringLiteral(loadableComponentsPath),
    ]),
  );
  referencePath.parentPath.addComment(
    "leading",
    `webpackChunkName: ${identifier}`,
  );

  const diractParent = referencePath.parentPath.parentPath;
  // loadable(() => loadableImport('./MyComponent')...
  if (t.isArrowFunctionExpression(diractParent)) {
    const loadableCall = diractParent.parentPath;
    t.assertCallExpression(loadableCall);
    const args = loadableCall.get("arguments");
    let options = args[1];
    if (args[1]) {
      options = options.node;
    } else {
      options = t.objectExpression([]);
      loadableCall.node.arguments.push(options);
    }
    options.properties.push(
      t.objectProperty(
        t.identifier("modules"),
        t.arrayExpression([t.stringLiteral(identifier)]),
      ),
    );
  } else {
    // loadable(async () => {
    // TODO: traverse, to async call if await
    const loadableCall =
      diractParent.parentPath.parentPath.parentPath.parentPath.parentPath;
    t.assertCallExpression(loadableCall);
    const args = loadableCall.get("arguments");
    let options = args[1];
    if (args[1]) {
      options = options.node;
    } else {
      options = t.objectExpression([]);
      loadableCall.node.arguments.push(options);
    }

    let modules = options.properties.find(
      x => x.type === "ObjectProperty" && x.key.name === "modules",
    );

    if (!modules) {
      options.properties.push(
        t.objectProperty(
          t.identifier("modules"),
          t.arrayExpression([t.stringLiteral(identifier)]),
        ),
      );
    } else {
      modules.value.elements.push(t.stringLiteral(identifier));
    }
  }
}
