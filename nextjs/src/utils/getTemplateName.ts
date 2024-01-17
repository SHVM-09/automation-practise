import { consola } from "consola";
import { verifyRepoPath } from "@/utils/templatePathUtils";

/**
 * Prompt the user to select a template name and verify its repository path.
 * @returns The selected template name.
 */
async function getTemplateName(): Promise<string> {
  // Prompt the user to select a template
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

  // Start verifying the template repository path
  consola.start("Verifying template repo path...");

  // Verify the repository path for the selected template
  const verified = await verifyRepoPath(templateName);
  if (!verified) {
      consola.error("Template repo path does not exist. Please update the repo path in src/configs/getPaths.ts file and try again.");
      throw new Error("Template repo path verification failed");
  }

  // Log success message
  consola.success("Template repo path verified!");
  return templateName;
}

export default getTemplateName;
