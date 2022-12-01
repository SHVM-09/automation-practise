// Thanks: https://stackoverflow.com/a/58032766/10796681
export const removeTrailingAndLeadingSlashes = (str: string) => str.replace(/^\/|\/$/g, '')
