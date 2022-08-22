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

1. Copy source to temp dir
2. Traverse the dir
   1. if file is SFC then get the JS code and replace script tag
3. Run TS compiler on all TS & TSX files => JS, JSX
4. Format the code using eslint
