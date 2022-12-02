import '@/utils/injectMustReplace'

/**
   * Adds received import string as last import statement
   *
   * https://regex101.com/r/3NfiKn/2
   *
   * @param data data source to add import
   * @param importStatement import statement as string
   * @returns Returns modified data
   */
export const addImport = (data: string, importStatement: string) => data.mustReplace(/(import .*\n)(\n*)(?!import)/gm, `$1${importStatement}\n$2`)

// https://regex101.com/r/ba5Vcn/2
export const addVitePlugin = (data: string, pluginConfig: string, insertTrailingComma = true) => data.mustReplace(/(( +)plugins:\s*\[)/gm, `$1\n$2$2${pluginConfig}${insertTrailingComma ? ',' : ''}`)
