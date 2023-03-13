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
  gh: {
    repoName: string
    ownerName: string
    branch?: string
  }
  gtm: GTMConfig
  laravel: {
    pkgName: string
    buyNowLink: string
    projectPath: string
    paths: {
      TSFull: string
      TSStarter: string
      JSFull: string
      JSStarter: string
    }
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => string
    documentation: {
      pageTitle: string
      docUrl: string
    }
    /**
     * Returns server path for providing relative path of demo relative to laravel core container for updating it in `index.php`.
     * @param demoNumber Demo number you are generating demo for
     * @param isStaging Is demo staging
     * @returns returns path after <demos.themeselection.com|demos.pixinvent.com>/html/<returnValue>
     */
    demoPathOnServer: (demoNumber: number, isStaging: boolean) => string
  }
}
