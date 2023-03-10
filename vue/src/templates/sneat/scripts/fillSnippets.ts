import { FillSnippets } from '@templates/base/fillSnippets'
import { Sneat, config } from '@templates/sneat'

const sneat = new Sneat(config)

const { tSFull, jSFull } = sneat.config.paths

new FillSnippets(tSFull, jSFull).fillSnippet()
