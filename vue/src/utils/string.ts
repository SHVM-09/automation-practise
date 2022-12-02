// Thanks: https://stackoverflow.com/a/58032766/10796681
export const removeTrailingAndLeadingSlashes = (str: string) => str.replace(/^\/|\/$/g, '')

/**
 * Removes all inline comments (//) from the data
 * @param str string you want to remove comment from
 * @returns Data without inline comments
 */
export const removeInlineComments = (str: string): string => str.replace(/^[ \t]*\/\/.*\r?\n|[ \t]*\/\/.*/gm, '')
