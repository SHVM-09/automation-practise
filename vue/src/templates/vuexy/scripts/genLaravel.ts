import { Laravel } from '@templates/base/laravel'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)
const laravel = new Laravel(vuexy.config)

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
