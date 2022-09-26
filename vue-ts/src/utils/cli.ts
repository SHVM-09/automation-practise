import { argv, chalk } from 'zx';

export const getCommand = (args: typeof argv) => {
  const {_: command} = args
  if (command.length === 0) throw Error(chalk.redBright('Command is required to run the script'))
  if (command.length !== 1) throw Error(chalk.redBright('Only single command is allowed'))
  return command[0]
}
