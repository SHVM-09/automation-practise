import { Laravel } from '@templates/base/laravel'
import { Master, config } from '@templates/master'

const master = new Master(config)

new Laravel(master.config).genTSFull()
