import { GenJS } from '@templates/base/genJS'
import { Materio, config } from '@templates/materio'

const materio = new Materio(config)

const jsGenerator = new GenJS(materio.config)
jsGenerator.genJS()
