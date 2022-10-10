export interface DemoConfigItem {
  find: string | RegExp
  replace: string
}

export interface TemplateBaseConfig {
  templateName: string
  projectPath: string
  packageCopyIgnorePatterns: string[]
  sKImagesRemovePatterns: string[]
  paths: {
    tSFull: string
    tSStarter: string
    jSFull: string
    jSStarter: string
    dataDir: string
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
  }
}
