import { GenPkg } from '@templates/base/genPkg'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)

await new GenPkg(vuexy.config).genPkg()
