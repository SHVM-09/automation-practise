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
}
