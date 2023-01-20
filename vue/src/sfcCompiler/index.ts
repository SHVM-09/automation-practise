import { parse } from 'acorn'
import type { namedTypes as n } from 'ast-types'
import { generate } from 'escodegen'
import { sfcToJs } from './sfcToJS'
import { extractComments, generateCodeFromAST } from './utils'

export class SFCCompiler {
  /**
   * Compiles given SFC and returns compiled script block of SFC
   * ❗ You have to inject this compiled script block in SFC yourself
   * @param sfc Vue SFC as string
   * @returns Compiled (JS) script block of SFC just like tsc does with ts & tsx files
   */
  compileSFCScript(sfc: string): string | undefined {
    const { code: compiledSfc, isCompiled, isScriptSetup } = sfcToJs(sfc)

    if (isCompiled && compiledSfc) {
      /*
        ℹ️ If it's script setup we need to treat it carefully
        Else if its just script then we already have compiled ready to replace code 🎉
      */

      // Remove generated `_useCssVars` when v-bind is used in style block (https://vuejs.org/api/sfc-css-features.html#v-bind-in-css)
      const _compiledSfc = compiledSfc.replace(/^\s+_useCssVars.*?}\)\);\n/gms, '')

      if (isScriptSetup) {
        const codeComments = extractComments(_compiledSfc).filter(cmt => cmt.nextLine.trim())

        // I think I don't need to format the generated code
        // const compiledFormattedSfc = await formatCode(_compiledSfc, eslintConfigFilePath)

        const jsSfcScriptSetup: string[] = []

        // @ts-expect-error This returns the program AST
        const { body } = parse(_compiledSfc, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }) as n.Program

        jsSfcScriptSetup.push(...this.extractImports(body))

        jsSfcScriptSetup.push(...this.extractPropsEmitsSetup(body))

        const jsSfc: string[] = []

        // ℹ️ We need to join and split again because jsSfcScriptSetup may contain whole block as single element and we want it to be single line
        jsSfcScriptSetup.join('\n').split('\n').forEach((line) => {
          // ℹ️ We need to trim line & comment next line to avoid indentation differences
          const comment = codeComments.find(cmt => line.trim() === cmt.nextLine.trim())

          if (comment) {
            // ℹ️ Add blank line before comment
            jsSfc.push('')
            jsSfc.push(comment.comment)
          }
          jsSfc.push(line)
        })

        // Remove first & last empty line
        if (jsSfc[0] === '')
          jsSfc.shift()
        if (jsSfc[jsSfc.length - 1] === '')
          jsSfc.pop()

        return ['<script setup>', ...jsSfc, '</script>'].join('\n')
      }
      else {
        return ['<script>', _compiledSfc.trim(), '</script>'].join('\n')
      }
    }
  }

  /**
   * Extract & compile the props, emits & needed script setup code from AST
   * @param astBody Program's body
   * @returns array of compiled props, emits & script setup code
   */
  private extractPropsEmitsSetup(astBody: n.Program['body']): string[] {
    const extractedCode: string[] = []

    astBody.forEach((node) => {
      // defineComponent export
      if (node.type === 'ExportDefaultDeclaration') {
        // defineComponent properties
        const options = ((node.declaration as n.CallExpression).arguments[0] as n.ObjectExpression).properties

        // We need `node.type === 'Property'` because for recursive components there can be `SpreadElement` in between as well
        const propsProperty: n.Property = options.find(node => node.type === 'Property' && (node.key as n.Identifier).name === 'props') as n.Property
        const emitsProperty: n.Property = options.find(node => node.type === 'Property' && (node.key as n.Identifier).name === 'emits') as n.Property
        const setupNode: n.Property = options.find(node => node.type === 'Property' && (node.key as n.Identifier).name === 'setup') as n.Property

        if (propsProperty) {
          // Add new line by pushing empty string
          extractedCode.push('')
          extractedCode.push(`const props = defineProps(${generate(propsProperty.value)})`)
        }

        if (emitsProperty) {
          // Add new line by pushing empty string
          extractedCode.push('')
          extractedCode.push(`const emit = defineEmits(${generate(emitsProperty.value)})`)
        }

        // setupContent wrapped in curly braces
        const setupContent = (setupNode.value as n.FunctionExpression).body
        setupContent.body = setupContent.body.filter(node => node.type !== 'ReturnStatement')

        // Add new line by pushing empty string
        extractedCode.push('')
        setupContent.body.forEach((_node) => {
          // ℹ️ Don't include `const props = __props`
          if (_node.type === 'VariableDeclaration') {
            const [declaration] = _node.declarations
            if (declaration.type === 'VariableDeclarator' && !((declaration.id as n.Identifier).name === 'props' && (declaration.init as n.Identifier).name === '__props'))
              extractedCode.push(generateCodeFromAST(_node))
          }
          else {
            extractedCode.push(generateCodeFromAST(_node))
          }
        })
      }
    })

    return extractedCode
  }

  /**
   * Extract & compile needed imports by removing unwanted imports generated by vue compiler
   * @param astBody Program's body
   * @returns array of compiled imports
   */
  private extractImports(astBody: n.Program['body']): string[] {
    const imports: n.ImportDeclaration[] = astBody.filter(node => node.type === 'ImportDeclaration') as n.ImportDeclaration[]
    const compiledImports: string[] = []

    imports.forEach((i) => {
      // Remove useless/extra imports

      /*
          ℹ️ When we compile Vue SFC to JS some imports are added automatically like below

          ```
          import {
              unref as _unref,
              resolveComponent as _resolveComponent,
              createVNode as _createVNode,
              withCtx as _withCtx,
              createTextVNode as _createTextVNode,
              withModifiers as _withModifiers,
              openBlock as _openBlock,
              createBlock as _createBlock,
          } from 'vue'
          ```

          We need to remove them
      */

      // If import is from vue, process it differently
      if (i.source.value === 'vue') {
        // Create specifier array
        const specifiers: n.ImportSpecifier[] = [] as n.ImportSpecifier[]

        // Only add specifiers that are not renamed
        (i.specifiers as n.ImportSpecifier[]).forEach((s: n.ImportSpecifier) => {
          if ((s.local && s.local.name) === s.imported.name)
            specifiers.push(s)
        })

        // If there's no specifiers, don't add import statement else add it
        if (specifiers.length) {
          i.specifiers = specifiers
          compiledImports.push(generate(i))
        }
      }

      // If it's not vue import just add it
      else {
        compiledImports.push(generate(i))
      }
    })

    return compiledImports
  }
}
