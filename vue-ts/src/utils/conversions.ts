export const pascalCaseToCamelCase = (str: string): string => str[0].toLowerCase() + str.slice(1)

export const titleCase = (str: string): string => str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())

export const toCamelCase = (str: string): string => {
  str = str.trim()

  /*
    Replace `_` & `-` with space
    this-is => this is
    this_is => this is
    this is => this is
    thisIs => thisIs
  */
  const woDashUnderscore = str.replace(/([_-])+/g, str)

  /*
    Add space before capital letters
    thisIs => this Is
    ThisIs => ' This Is'
    this-is => this-is
    this => 'this'
    This => ' This'
    Later on strip() removes the space around the string
  */
  const spaceBeforeCapital = woDashUnderscore.replace(/([A-Z])/g, ' $1')

  /*
    Call title method. Capitalize first char after space.
    this is => This Is
    this Is => This Is
    This is => This Is
    This Is => This Is
  */
  const titled = titleCase(spaceBeforeCapital)

  /*
  Remove space between words
  This Is => ThisIs
 */
  const pascalCased = titled.replace(/ /g, '')

  return pascalCaseToCamelCase(pascalCased)
}
