const images: Record<string, string[]> = {
  materio: [
    'public/images/avatars/1.png',
    'public/images/pages/misc-mask-dark.png',
    'public/images/pages/misc-mask-light.png',
    'public/images/pages/auth-v2-mask-dark.png',
    'public/images/pages/auth-v2-mask-light.png',
    'public/images/illustrations/objects/tree-1.png',
    'public/images/illustrations/objects/tree-2.png',
    'public/images/illustrations/auth/v2-login-dark-border.png',
    'public/images/illustrations/auth/v2-login-dark.png',
    'public/images/illustrations/auth/v2-login-light-border.png',
    'public/images/illustrations/auth/v2-login-light.png',
    'public/images/illustrations/characters/9.png'
  ],
  materilize: ['public/images/avatars/1.png'],
  vuexy: ['public/images/avatars/1.png'],
  sneat: ['public/images/avatars/1.png']
}

export const getImagePaths = (templateName: string): string[] => {
  return images[templateName] || []
}
