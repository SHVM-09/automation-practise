import { Laravel } from '@templates/base/laravel'
import { Master, config } from '@templates/master'

const master = new Master(config)
const laravel = new Laravel(master.config)

// Laravel TS Full
laravel.genLaravel()

// Laravel TS Starter
laravel.genLaravel({ isSK: true })

// Laravel JS Full
laravel.genLaravel({ isJS: true })

// Laravel JS Starter
laravel.genLaravel({
  isJS: true,
  isSK: true,
})
