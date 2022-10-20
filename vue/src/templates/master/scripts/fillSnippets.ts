import { FillSnippets } from '@templates/base/fillSnippets'
import { Master, config } from '@templates/master'

const master = new Master(config)

const { tSFull, jSFull } = master.config.paths

new FillSnippets(tSFull, jSFull).fillSnippet()
