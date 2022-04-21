/** @typedef {import('@babel/core')} BabelObj */

/** @type {(babel: BabelObj) => import('@babel/core').PluginObj} */
module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: 'babel-plugin-library-aliases',
    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path;

        const opts = state.opts || {};
        const libraries = Object.keys(opts);

        if (libraries.includes(node.source.value) === false) {
          return;
        }

        // TODO `config.ignore`: support RegExp or RegExp string.
        const config = opts[node.source.value];
        const components = Object.keys(config.aliases);

        const specifiers = node.specifiers.filter(s => {
          if (t.isImportSpecifier(s)) {
            return components.some(
              name =>
                s.imported.name === name &&
                (config.ignore ? !config.ignore(s.imported, s.local) : true)
            );
          }

          if (t.isImportDefaultSpecifier(s)) {
            return components.some(
              name =>
                'default' === name &&
                (config.ignore ? !config.ignore(null, s.local) : true)
            );
          }

          return false;
        });

        const imports = [];

        specifiers.forEach(specifier => {
          let importName = '';

          if (specifier && t.isImportDefaultSpecifier(specifier)) {
            importName = 'default';
          } else if (specifier && t.isImportSpecifier(specifier)) {
            importName = specifier.imported.name;
          }

          if (importName) {
            const target = config.aliases[importName];
            const [source, name] = target.split('#');
            const imported = name || importName;
            const newSpecifier =
              imported === 'default'
                ? t.importDefaultSpecifier(specifier.local)
                : t.importSpecifier(
                    specifier.local,
                    t.identifier(name || importName)
                  );

            imports.push(
              t.importDeclaration([newSpecifier], t.stringLiteral(source))
            );

            node.specifiers = node.specifiers.filter(s => s !== specifier);
          }
        });

        if (imports.length) {
          path.insertAfter(imports);
        }

        if (node.specifiers.length < 1) {
          path.remove();
        }
      }
    }
  };
};
