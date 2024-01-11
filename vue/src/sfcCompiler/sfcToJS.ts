import consola from 'consola'
import { compileScript, parse } from 'vue/compiler-sfc'
import { tsCompile } from '@/sfcCompiler/utils'

interface SfcToJSReturnType { code: string | null; isCompiled: boolean; isScriptSetup: boolean }

export const sfcToJs = (sfc: string): SfcToJSReturnType => {
  const parsedSfc = parse(sfc)

  if (parsedSfc.descriptor.script !== null && parsedSfc.descriptor.scriptSetup !== null)
    throw consola.error('Error while parsing SFC')

  // Skip if there's no script block
  if (parsedSfc.descriptor.script === null && parsedSfc.descriptor.scriptSetup === null)
    return { code: null, isCompiled: false, isScriptSetup: false }

  const { content } = compileScript(parsedSfc.descriptor, {
    id: Date.now().toString(),
    isProd: false,
    inlineTemplate: true,
    babelParserPlugins: ['typescript'],
    sourceMap: false,
    templateOptions: {
      id: Date.now().toString(),
      isProd: true,
      ssr: false,
      compilerOptions: {
        expressionPlugins: ['typescript'],
        isTS: true,
      },
    },
    hoistStatic: false,
  })

  return {
    code: tsCompile(content),
    isCompiled: true,
    isScriptSetup: parsedSfc.descriptor.scriptSetup !== null,
  }
}
