import { FillSnippets } from '@templates/base/fillSnippets'
import { Materialize, config } from '@templates/materialize'

const materialize = new Materialize(config)

const { tSFull, jSFull } = materialize.config.paths

new FillSnippets(tSFull, jSFull).fillSnippet()
