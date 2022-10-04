export interface DemoConfigItem {
  find: string | RegExp
  replace: string
}

export interface TemplateBaseConfig {
  templateName: string
  projectPath: string
  packageCopyIgnorePatterns: string[]
  paths: {
    tSFull: string
    tSStarter: string
    jSFull: string
    jSStarter: string
  }
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => string
  demosConfig: (DemoConfigItem[] | null)[]
}
