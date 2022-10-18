import chalk from 'chalk'
import type { ParsedArgs } from 'minimist'

export const getCommand = (args: ParsedArgs) => {
  const { _: command } = args
  if (command.length === 0)
    throw new Error(chalk.redBright('Command is required to run the script'))
  if (command.length !== 1)
    throw new Error(chalk.redBright('Only single command is allowed'))
  return command[0]
}
