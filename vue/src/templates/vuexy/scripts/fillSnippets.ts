import { FillSnippets } from '@templates/base/fillSnippets'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)

const { tSFull, jSFull } = vuexy.config.paths

new FillSnippets(tSFull, jSFull).fillSnippet()
