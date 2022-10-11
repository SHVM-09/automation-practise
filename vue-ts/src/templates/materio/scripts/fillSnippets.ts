import { FillSnippets } from '@templates/base/fillSnippets'
import { Materio, config } from '@templates/materio'

const materio = new Materio(config)

const { tSFull, jSFull } = materio.config.paths

new FillSnippets(tSFull, jSFull).fillSnippet()
