# Execution

- [x] Fill TS snippets
- [ ] Convert TS project to JS
  - [ ] Fill JS snippets

## Execution Order

1. Fill TS Snippets
2. Copy the source to a temp location
3. Convert TS Project to JS
   1. Compile to JS
   2. Fill JS snippets in temp
   3. Copy the code files to a source so they have both TS & JS.

---

## Fill TS Code snippets

1. Traverse `src/views` directory to look for `demoCodeXXX.ts` file
   1. If file found
      1. Traves that directory
         1. (as file) Copy file content
         2. Write copied content to relative `demoCodeXXX.ts` variable
   2. Continue

## Convert TS project to JS

We need a few files:

1. tsconfig.emitJS.json

---

1. Traverse the src dir

   - (file) If the file is Vue SFC
      - Extract the script part to the TS file (_ts file should have `_` as a prefix. e.g._App.vue.ts_)

2. Compile the project
3. Traverse the src dir
   1. Fill JS snippets
   2. Replace generated JS with the script block (_Make sure to remove the lang attr_)
   3. Remove emitted JS file (_if not debugging_)
4. Format the code using a linter
