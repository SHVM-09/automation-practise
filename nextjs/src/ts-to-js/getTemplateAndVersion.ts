import { consola } from "consola";
import { verifyRepoPath } from "@/utils/templatePathUtils"
import { folderExist } from "@/utils/fsUtils";

async function main() {
    /**
     * Get template name from user
     */
    const templateName = await consola.prompt("Select Template to generate JavaScript from TypeScript", {
        type: "select",
        options: [
            { label: "Materio - MUI - NextJS", value: "materio", hint: "Materio MUI NextJS Admin Template Pro" },
            { label: "Materio - MUI - NextJS - Free", value: "materio-free", hint: "Materio MUI NextJS Admin Template Free" },
            { label: "Materialize - MUI - NextJS", value: "materialize", hint: "Materialize MUI NextJS Admin Template Pro" },
            { label: "Sneat - MUI - NextJS", value: "sneat", hint: "Sneat MUI NextJS Admin Template Pro" },
            { label: "Sneat - MUI - NextJS - Free", value: "sneat-free", hint: "Sneat MUI NextJS Admin Template Free" },
            { label: "Vuexy - MUI - NextJS", value: "vuexy", hint: "Vuexy MUI NextJS Admin Template Pro" },
        ],
    }) as unknown as string;

    consola.start("Verifying template repo path...");

    const verified = await verifyRepoPath(templateName);
    if (!verified) {
        consola.error("Template repo path does not exist. Please update the repo path in src/configs/getPaths.ts file and try again.");
        return
    }
    
    consola.success("Template repo path verified!");


    /**
     * Get template version from user
     */
    const version = await consola.prompt("Select Template Version", {
        type: "select",
        options: [
            { label: "Full Version", value: "full-version", hint: "Full version of the template" },
            { label: "Starter Kit", value: "starter-kit", hint: "Starter kit of the template" },
            { label: "Both", value: "both", hint: "Both Full version and Starter Kit of the template"}
        ],
    }) as unknown as string;

    if(version === "both") {
        // Verify full version path
        consola.start("Verifying Full Version path...");
        if(!folderExist(`${verified}/typescript-version/full-version`)) {
            consola.error("Full Version does not exist.");
            return
        }
        else {
            consola.success("Full Version path verified!");
        }

        // Verify starter kit path
        consola.start("Verifying Starter kit path...");
        if(!folderExist(`${verified}/typescript-version/starter-kit`)) {
            consola.error("Starter kit does not exist.");
            return
        }
        else {
            consola.success("Starter kit path verified!");
        }
    }
    else {
        // Verify selected version path
        consola.start("Verifying selected version path...");
        if(!folderExist(`${verified}/typescript-version/${version}`)) {
            consola.error(`${version} does not exist.`);
            return
        }
        else {
            consola.success("Selected version path verified!");
        }
    }

    // Return template name and version
    return { templateName, version }
}

export default main;