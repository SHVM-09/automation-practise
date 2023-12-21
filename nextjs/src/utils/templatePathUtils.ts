// This file will help to verify all master repos and template repos paths on local system

// Import dependencies
import * as fs from 'fs';

// Import functions and types
import { getTemplateRepoPaths } from '@/configs/getPaths';

// Verify repo path
export function verifyRepoPath(repoName: string) {
    const repoPath = getTemplateRepoPaths[repoName];
    if (!fs.existsSync(repoPath)) {
        console.log(`Template repo path for '${repoName}' does not exist: ${repoPath}. Please update the repo path in src/configs/getPaths.ts file and try again.`);
        return false
    }
    return repoPath
}

// return Typescript root path based on the given template path
export function getTsRootPath(templateName: string) {
    const templatePath = getTemplateRepoPaths[templateName];
    
    return `${templatePath}/typescript-version`
}

export function getJsRootPath(templateName: string) {
    const templatePath = getTemplateRepoPaths[templateName];

    return `${templatePath}/javascript-version`
}

// return Typescript version path based on the given template path and version
export function getTsVersionPath(templateName: string, version: string) {
    const templatePath = getTemplateRepoPaths[templateName];

    return `${templatePath}/typescript-version/${version}`
}

// return JavaScript version path based on the given template path and version
export function getJsVersionPath(templateName: string, version: string) {
    const templatePath = getTemplateRepoPaths[templateName];

    return `${templatePath}/javascript-version/${version}`
}