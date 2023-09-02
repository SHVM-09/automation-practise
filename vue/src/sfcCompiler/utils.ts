import { generate } from 'escodegen'
import ts from 'typescript'

/**
 * Compile TS source code and return compiled JS code
 * @param source TypeScript code as string
 * @param options tsconfig options
 * @returns compiled JS code
 */
export const tsCompile = (source: string, options: ts.TranspileOptions | null = null): string => {
  // Default options -- you could also perform a merge, or use the project tsconfig.json
  if (options === null) {
    options = {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
      },
    }
  }
  return ts.transpileModule(source, options).outputText
}

// We need this function for `{ format: { escapeless: true } }` escodegen option to preserve the emojis while generating the code from AST node
export const generateCodeFromAST = (ast: unknown) => generate(ast, {
  format: {
    escapeless: true,
    indent: {
      // indent using two spaces
      style: '  ',
    },
  },
})

export const extractComments = (content: string) => {
  const lines = content.split('\n')
  const comments: { comment: string; nextLine: string }[] = []

  let multilineComment = ''
  let isMultilineCommentActive = false

  lines.forEach((line, index) => {
    const _line = line.trim()

    if (isMultilineCommentActive) {
      multilineComment += _line === '*/' ? _line : (`${_line}\n`)

      if (_line === '*/') {
        isMultilineCommentActive = false
        comments.push({
          comment: multilineComment,
          nextLine: lines[index + 1],
        })
      }
    }
    else {
      // find block comment
      if (_line.match(/^\s*\/\//g)) {
        // ℹ️ Don't include typescript eslint comments
        if (!_line.includes(' @typescript-eslint/')) {
          comments.push({
            comment: _line,
            nextLine: lines[index + 1],
          })
        }
      }

      // Find multiline comment
      if (_line.startsWith('/*')) {
        if (_line.endsWith('*/')) {
          comments.push({
            comment: _line,
            nextLine: lines[index + 1],
          })
        }
        else {
          multilineComment = '/*'
          isMultilineCommentActive = true
        }
      }
    }
  })

  return comments
}
