import chalk from 'chalk'

export const success = (...text: unknown[]) => console.log(`${chalk.greenBright(text.join(' '))}\n`)
export const info = (...text: unknown[]) => console.log(`${chalk.cyanBright(text.join(' '))}\n`)
export const warning = (...text: unknown[]) => console.log(`${chalk.yellowBright(text.join(' '))}\n`)
export const error = (...text: unknown[]) => console.log(`${chalk.redBright(text.join(' '))}\n`)
