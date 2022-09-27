import chalk from 'chalk';
import { ParsedArgs } from 'minimist';


export const getCommand = (args: ParsedArgs) => {
  const {_: command} = args
  if (command.length === 0) throw Error(chalk.redBright('Command is required to run the script'))
  if (command.length !== 1) throw Error(chalk.redBright('Only single command is allowed'))
  return command[0]
}
