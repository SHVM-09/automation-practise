const urls: Record<string, Record<string, string>> = {
  materio: {
    'https://demos.themeselection.com/materio-mui-nextjs-admin-template/documentation/':
      'https://demos.themeselection.com/marketplace/materio-mui-nextjs-admin-template/documentation/',
    'https://themeselection.com/item/materio-mui-nextjs-admin-template':
      'https://mui.com/store/items/materio-mui-react-nextjs-admin-template',
    'https://themeselection.com/license': 'https://mui.com/store/license/',
    'https://themeselection.com': 'https://mui.com/store/contributors/themeselection/'
  }
}

export const getUrls = (templateName: string): Record<string, string> => {
  return urls[templateName]
}
