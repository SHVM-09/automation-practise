import { GenJS } from '@templates/base/genJS'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)

const jsGenerator = new GenJS(vuexy.config, false, true)
jsGenerator.genJS()
