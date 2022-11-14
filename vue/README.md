# Why do things manually 😎

## Welcome

### Running automation scripts

You can run automation via scripts. You can find each template's scripts in `src/templates/<template-name>/scripts`

These are normal scripts that you run except it requires running via [tsx](https://github.com/esbuild-kit/tsx). To run the script use:

```bash
yarn tsx src/templates/<template-name>/scripts/<script-file-with-extension> <params-if-any>
```

While generating JS version or its superior scripts you might get warning or error for rule `vue/require-default-prop`. Ignore this rule's error as this error's code will be generated via vue compiler and we don't have control over it.

### Adding new template to automation universe

All the template's have its own scripts and isn't bound to other template. To keep code DRY, core and common functionality/logic is moved to `src/templates/base/`.

Refer to other templates e.g. `materio` to add new template.

Rough steps:

1. Copy materio and name it vuexy
2. Change everything related to materio to vuexy in all file of `src/templates/vuexy/`
3. Remove `lastUpdatedAt` value in `src/templates/vuexy/data/tracker.json` file
4. Update data files if needed (must verify for first time)

### Requirement for GitHub Access Token

🚧 WIP

Set your GH PAT via in `.env` file. This is required for generating starter-kit and its superior scripts.

## Credits

- [globby](https://github.com/sindresorhus/globby)
- [chalk](https://github.com/chalk/chalk)
- [path](https://nodejs.org/api/path.html#pathdelimiter)
- [os](https://nodejs.org/api/os.html)
- [minimist](https://www.npmjs.com/package/minimist)
- [node-fs-extra](https://github.com/jprichardson/node-fs-extra)

## Reference

- [Experimental vue-sfc-to-js](https://github.com/jd-solanki/vue-sfc-to-js)
- [clevision-template-automation](https://github.com/jd-solanki/clevision-template-automation)
