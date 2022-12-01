import { Laravel } from '@templates/base/laravel'
import { Master, config } from '@templates/master'

const master = new Master(config)
const laravel = new Laravel(master.config)

// Laravel TS Full
laravel.genTSFull()

// Laravel TS Starter
laravel.genTSStarter()

// Laravel JS Full
laravel.genJSFull()

// Laravel JS Starter
laravel.genJSStarter()
