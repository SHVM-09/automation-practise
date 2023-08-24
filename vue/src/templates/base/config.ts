export interface GTMConfig {
  headScript: string
  bodyNoScript: string
}

export interface DemoConfigItem {
  find: string | RegExp
  replace: string
}

export type TemplateDomain = 'ts' | 'pi'

export interface TemplateBaseConfig {
  templateName: Lowercase<string>
  templateDomain: TemplateDomain
  projectPath: string
  packageCopyIgnorePatterns: string[]
  sKImagesRemovePatterns: string[]
  paths: {
    tSFull: string
    tSStarter: string
    jSFull: string
    jSStarter: string
    dataDir: string
    freeJS: string
    freeTS: string
    docs: string
  }
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => string
  demosConfig: (DemoConfigItem[] | null)[]
  documentation: {
    pageTitle: string
    docUrl: string
  }
  changelog: {
    pageTitle: string
    url: string
  }
  gh: {
    repoName: string
    ownerName: string
    branch?: string
  }
  gtm: GTMConfig
  nuxt: {
    pkgName: string
  }
  laravel: {
    pkgName: string
    buyNowLink: string
    projectPath: string
    paths: {
      TSFull: string
      TSStarter: string
      JSFull: string
      JSStarter: string
      freeJS: string
      freeTS: string
    }
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => string
    documentation: {
      pageTitle: string
      docUrl: string
    }
    changelog: {
      pageTitle: string
      url: string
    }
  }
}
