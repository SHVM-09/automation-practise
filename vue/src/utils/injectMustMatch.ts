interface String {
  mustMatch(pattern: RegExp): Promise<IterableIterator<RegExpMatchArray>>
}

/**
 * This helper utility function make sure passed regex matches the string. It will throw error if no match is found for provided `searchValue`.
 * @param str string you want to perform replace on
 * @param searchValue regex you want to search for in source string
 * @returns matched result
 */
// eslint-disable-next-line no-extend-native
String.prototype.mustMatch = async function (pattern: RegExp) {
  // If regex can't get match in str => throw error
  /*
    ℹ️ We can't store match result in variable and check length because `matchAll` returns iterator and even if we access via `next()` it will consume the iterator and we can't use it again.
    Another workaround is converting iterator to array and check length but that will consume more memory.
   */
  if (this.matchAll(pattern).next().done) {
    const { consola } = await import('consola')
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw consola.error(new Error(`Can't find any match for "${String(pattern)}" in "${this}".`))
  }

  return this.matchAll(pattern)
}
