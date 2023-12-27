import '@/utils/injectMustMatch'
import { parse } from 'acorn'
import type { namedTypes as n } from 'ast-types'
import { consola } from 'consola'
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
  async compileSFCScript(sfc: string): Promise<string | undefined> {
    const { code: compiledSfc, isCompiled, isScriptSetup } = sfcToJs(sfc)

    if (isCompiled && compiledSfc) {
      /*
        ℹ️ If it's script setup we need to treat it carefully
        Else if its just script then we already have compiled ready to replace code 🎉
      */

      // Remove generated `_useCssVars` when v-bind is used in style block (https://vuejs.org/api/sfc-css-features.html#v-bind-in-css)
      let _compiledSfc = compiledSfc.replace(/^\s+_useCssVars.*?}\)\);\n/gms, '')

      /*
        Handle await usage in script setup
        When we use await for API calls in script setup vue generates code like below:
        ```
        let __temp, __restore

        // some other code

        const result = (
          ([__temp,__restore] = _withAsyncContext(() => new Promise(r => setTimeout(r, 2000)))),
          __temp = await __temp,
          __restore(),
          __temp
        )
        ```

        We need to remove this code and replace it back with normal `await` keyword & remove `__temp` & `__restore` variables
      */
      if (_compiledSfc.includes('let __temp, __restore')) {
        _compiledSfc = _compiledSfc.mustReplace(
          /\(\[__temp, __restore\] = _withAsyncContext\(\(\) => (.*?)\),\s*__temp = await __temp,\s*__restore\(\),\s*__temp\);/gms,
          'await $1',
        )

        // Remove `let __temp, __restore` line
        _compiledSfc = _compiledSfc.mustReplace(/let __temp, __restore;\n/gm, '')
      }

      // Remove duplicate emit
      _compiledSfc = _compiledSfc.replace("const emit = __emit;", "")

      // handle defineExpose => __expose
      _compiledSfc = _compiledSfc.replaceAll('__expose', 'defineExpose')

      if (isScriptSetup) {
        const codeComments = extractComments(_compiledSfc).filter(cmt => cmt.nextLine.trim())

        const jsSfcScriptSetup: string[] = []

        const { body } = parse(_compiledSfc, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }) as n.Program

        jsSfcScriptSetup.push(...this.extractImports(body))

        if (sfc.includes('defineOptions({')) {
          const defineOptionsMatch = await sfc.mustMatch(/(?<defineOptions>defineOptions.*?\n}\))/gms)
          const defineOptionsStr = Array.from(defineOptionsMatch)[0].groups?.defineOptions

          if (!defineOptionsStr)
            throw consola.error('Error extracting `defineOptions` from SFC: ', sfc)

          jsSfcScriptSetup.push(defineOptionsStr)
        }

        jsSfcScriptSetup.push(...this.extractPropsEmitsSetup(body))

        const jsSfc: string[] = []

        // ℹ️ We have to do normalization to avoid indentation & formatting differences. E.g. {a,b} vs { a, b }
        const _normalizeLineForComments = (line: string) => line.trim().replaceAll(' ', '')

        // ℹ️ We need to join and split again because jsSfcScriptSetup may contain whole block as single element and we want it to be single line
        jsSfcScriptSetup.join('\n').split('\n').forEach((line) => {
          const comment = codeComments.find(cmt => _normalizeLineForComments(line) === _normalizeLineForComments(cmt.nextLine))

          if (comment) {
            const normalizedNextLine = _normalizeLineForComments(comment.nextLine)
            if (!(normalizedNextLine.startsWith('//') || normalizedNextLine.startsWith('/*'))) {
              const nextComment = codeComments.find(cmt => _normalizeLineForComments(comment.comment) === _normalizeLineForComments(cmt.nextLine))

              if (nextComment) {
                // ℹ️ Add blank line before comment
                jsSfc.push('', nextComment.comment)
              }
            }

            // Add actual comment after the previous dependent comment is added
            // ℹ️ Add blank line before comment
            jsSfc.push('', comment.comment)
          }
          jsSfc.push(line)
        })

        // Remove first & last empty line
        if (jsSfc[0] === '')
          jsSfc.shift()
        if (jsSfc[jsSfc.length - 1] === '')
          jsSfc.pop()

        // If there's ending comment in SFC script block add it back
        const endingComment = codeComments.find(cmt => cmt.nextLine.trim() === 'return (_ctx, _cache) => {')
        const startingComment = codeComments.find(cmt => cmt.nextLine.trim() === 'export default /*#__PURE__*/ _defineComponent({')

        if (endingComment)
          jsSfc.push(endingComment.comment)

        let returnValue = ['<script setup>', ...jsSfc, '</script>'].join('\n')
        if (startingComment)
          returnValue = returnValue.mustReplace(/(<script.*?>\n(?:.*import .*?\n\s+)?)/gms, `$1${startingComment.comment}\n`)

        return returnValue
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
