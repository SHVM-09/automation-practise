import { GenJS } from '@templates/base/genJS'
import { Master, config } from '@templates/master'

const master = new Master(config)

const jsGenerator = new GenJS(master.config)
jsGenerator.genJS()
