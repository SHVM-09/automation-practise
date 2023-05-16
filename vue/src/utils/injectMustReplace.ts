interface String {
  mustReplace(searchValue: string | RegExp, replaceValue: string): string
}

/**
 * This helper utility function make sure regex always performs the replace. It will throw error if no match is found for provided `searchValue`.
 * @param str string you want to perform replace on
 * @param searchValue string or regex you want to search for in source string
 * @param replaceValue replace you want to make with matched result
 * @returns replaced result
 */
// eslint-disable-next-line no-extend-native
String.prototype.mustReplace = function (searchValue: string | RegExp, replaceValue: string) {
  // If regex can't get match in str => throw error
  if (!this.match(searchValue))
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Can't find match for "${String(searchValue)}" in "${this}". You wanted to replace the result with "${replaceValue}"`)

  return this.replaceAll(searchValue, replaceValue)
}
