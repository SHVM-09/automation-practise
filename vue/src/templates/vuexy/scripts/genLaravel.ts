import { Laravel } from '@templates/base/laravel'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)
const laravel = new Laravel(vuexy.config)

laravel.genPkg()
