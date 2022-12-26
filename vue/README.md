# Why do things manually 😎

## Welcome

`automation-scripts/vue` contains automation scripts for vue projects.

Make sure to enable watcher for VSCode extension [sync-env](https://marketplace.visualstudio.com/items?itemName=dongido.sync-env)

This project contains scripts written in TypeScript for better typing and preventing errors. In the `src` directory, you can find all our source code.

- `sfcCompiler`: This directory is super sensitive. Don't touch it unless your ass is on fire. This directory contains business logic to compile the TS SFC code to JS SFC 😱
- `templates`
  - `base`: This directory contains core business logic. This is where all the magic is written. It contains code of processing various automation like generating demos, generating package, generating laravel, etc.
  - `<template-name>`: This directory can be any template materio, vuexy, sneat, etc. This directory holds template specific data/code & scripts.
    - **data**: This directory will have arbitrary data any automation will need. Mainly we use this for storing starter-kit files to copy in package while generating starter-kit version. One of most important file is `tracker.json`, you must place this file directly under `data` directory. This file will hold the history of source file you have created starter-kit files from. But Why 🤔? Assume, you created template Waxo and you created `Login.vue` for starter-kit by removing some links and other stuff and you placed it in this directory. Now note that this isn't linked to source file `Login.vue` in the full version of the template. That means if you change something in `Login.vue` and forgot to update in automation's template dir then you are f*. To resolve this tracking issue, we have `tracker.json` file that will track time of latest commit for that source file. Now, let's repeat the above scenario again. You have create `Login.vue` on 5 Dec and created starter-kit file and placed updated time for source file commit in `tracker.json`. Next time when you update the `Login.vue` file and when you run the automation, `tracker.json` file will tell our automation script that `Login.vue`'s latest commit time isn't maching the time I have recorded. So now you will get the latest changes from source `Login.vue` to SK `Login.vue` and update the time in `tracker.json` file. For ease, if you are creating `Login.vue` for first time or wanting to update the time after making changes to SK file, you can empty the `lastUpdatedAt` to let script autofill the latest commit time in proper format.
    - `scripts`: This is scripts directory where you import business logic from `../base` directory and create script.
    - **config.ts**: This is configuration file for the template. This will tell your script things like template name, template's local path, demo configurations, files to copy etc.
    - `index.ts`: this is just entry file that exports config and template
    - `template.ts`: this is actual template represented as class. Mostly you will just inherit from base class and done.
- `utils`: This directory contains super useful custom-made utilities for using in scripts and keeping your code DRY and readable.

We use some third-party libraries in our automation scripts because node doesn't have built support for them **like python**.

**Third-party libs:**

1. [acorn](https://github.com/acornjs/acorn): For AST parsing in `sfcCompiler`
2. [chalk](https://github.com/chalk/chalk): For colored outputs
3. [dotenv](https://github.com/motdotla/dotenv): For reading env vars from `.env` file
4. [escodegen](https://github.com/estools/escodegen): for generating es6 code from AST nodes (`sfcCompiler`)
5. [fs-extra](https://github.com/jprichardson/node-fs-extra): Provides convenient features for working with file system
6. [globby](https://github.com/sindresorhus/globby): for globbing
7. [minimist](https://github.com/minimistjs/minimist): For parsing CLI.

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

This is required to fetch the latest commit from GitHub private repository. Remember, `tracker.json` file.

Set your GH PAT via in `.env` file. This is required for generating starter-kit and its superior scripts.

## Reference

- [Experimental vue-sfc-to-js](https://github.com/jd-solanki/vue-sfc-to-js)
- [clevision-template-automation](https://github.com/jd-solanki/clevision-template-automation)

## Why Python?

### Pros

- Built in support for file globbing
- Richer file system API and controls
- Can create great and user friendly CLI apps using [Typer](https://typer.tiangolo.com/) ❤️
- Less third-party libs
- Less & understandable code

### Cons

- Other devs don't know it
