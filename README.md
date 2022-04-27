# `babel-plugin-library-aliases`

Just a hacking tool. Useful when you have to **patch** some library dependencies.

## Usage

SEE [Playground](https://astexplorer.net/#/gist/d8677b464cdd083422ed42fad30f9d15/473977856ffb5665a9bdab47ae6a07b6f75e93a9)

```js
// in your babel.config.js:

module.exports{
  // ... other fields
  plugins: [
    // ... other plugins
    [
      'babel-plugin-library-aliases',
      {
        'antd': {
          aliases: {
            // NOTE: Relative path is not supported
            Modal: 'src/components/CustomModal',
            message: 'src/components/customMessage',
            Alert: 'src/components/index#CumstomAlert',
          },
          ignore(imported, local) {
            // if you are using `import { AntdModal } from 'antd'`,
            // it will still use the original exported member from the `antd` library
            return /^[aA]ntd/.test(local.name);
          }
        },

        'some-library': {
          aliases: {
            hello: 'src/components/hack_hello',
            world: 'src/components/hack_world#default',
            default: 'src/components/hack_component#NamedExportComponent'
          },
          ignore(imported, local) {
            // imported may be null (case: import default)
            return local.name.startsWith('Original');
          }
        }
      }
    ]
  ];
}
```
