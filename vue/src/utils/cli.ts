import { consola } from 'consola'
import type { ParsedArgs } from 'minimist'

export const getCommand = (args: ParsedArgs) => {
  const { _: command } = args
  if (command.length === 0)
    consola.error(new Error('Command is required to run the script'))
  if (command.length !== 1)
    consola.error(new Error('Only single command is allowed'))
  return command[0]
}
