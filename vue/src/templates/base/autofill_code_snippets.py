import fileinput
import re
import subprocess
from pathlib import Path

from utils import to_camel_case


def replace_path(path: Path, start: str, prepend: str):
    index = path.parts.index(start)
    return Path(prepend).joinpath(*path.parts[index:])


class AutoFillCodeSnippets:
    def __init__(self, source_dir: str | Path):
        self.SOURCE_ROOT_DIR = Path(source_dir)
        self.SRC_DIR = self.SOURCE_ROOT_DIR / "src"

    def gen_demo_var_name_regex(self, var_name: str):
        """
        Returns regex for finding & replacing content for single demo

        Link: https://regex101.com/r/XTWO6x/3

        Groups:
            1st => TS snippet
            2nd => '>' or _might not exist_
            3rd => JS snippet
            4th => '>' or _might not exist_
        """
        return (
            f"export const {var_name} = "
            + r"{[\s\n]*ts: [`'\"]{1}((\n|.)*?)[`'\"]{1},[\s\n]*js: [`'\"]{1}((\n|.)*?)[`'\"]{1},?[\s\n]*}"
        )

    def fill_code_snippets(self, js: Path | None):

        _SRC_DIR = js or self.SRC_DIR

        # Find snippet files
        for snippet_file in _SRC_DIR.rglob(
            "demoCode*.ts" if not js else "demoCode*.js"
        ):

            # Directory that hold all the snippets. E.g. Alert dir which has all the demos along with code snippet file
            SNIPPETS_DIR = snippet_file.parent

            # Remove `demoCode` prefix & `.ts` suffix to extract the name. (e.g. demoCodeAlert.ts => Alert)
            # ℹ️ Name will be in pascal case
            SNIPPET_OF = snippet_file.name[8:-3]

            # Read the snippet file content
            snippet_file_content = snippet_file.read_text()

            # Open snippet file for writing
            with open(snippet_file, "w") as snippet_file_fp:

                # Loop over all demo files except snippet file
                for demo in SNIPPETS_DIR.rglob("*.vue"):

                    # Get the demo code & escape back ticks
                    DEMO_CONTENT = (
                        demo.read_text().replace("`", r"\`").replace("$", r"\$")
                    )

                    # demo.name[4:-4] => Remove `demo` prefix & `.vue` suffix (e.g. DemoAlertBasic.vue => AlertBasic)
                    # ℹ️ Result will be in pascal case

                    # [len(SNIPPET_OF) :] => Remove component name and camel case the string (e.g. AlertBasic => basic)
                    DEMO_VAR_NAME = to_camel_case(demo.name[4:-4][len(SNIPPET_OF) :])

                    REGEX_TO_REPLACE_DEMO_CONTENT = self.gen_demo_var_name_regex(
                        DEMO_VAR_NAME
                    )

                    # Update the file content and assign it to itself so other demos can use the updated content
                    snippet_file_content = re.sub(
                        REGEX_TO_REPLACE_DEMO_CONTENT,
                        rf"""export const {DEMO_VAR_NAME} = {{ ts: `{DEMO_CONTENT}`, js: `\3` }}"""
                        if not js
                        else rf"""export const {DEMO_VAR_NAME} = {{ ts: `\1`, js: `{DEMO_CONTENT}` }}""",
                        snippet_file_content,
                    )

                # Finally, when all demos are injected in file content use it to update the snippet file
                snippet_file_fp.write(snippet_file_content)

                # If it's JS project write to TS code snippets as well
                if js:
                    ts_snippet_file = replace_path(
                        snippet_file, "src", str(self.SOURCE_ROOT_DIR)
                    ).with_suffix(".ts")
                    ts_snippet_file.write_text(snippet_file_content)

    def compile_to_js(self):
        """@deprecated"""

        SCRIPT_BLOCK_CONTENT_REGEX = re.compile(
            r"^<script.*>((\n|.)*?)</script>$", re.MULTILINE
        )

        # Extract script block to ts file
        for sfc in self.SRC_DIR.rglob("*.vue"):
            result = re.search(SCRIPT_BLOCK_CONTENT_REGEX, sfc.read_text())
            if result:
                with open(sfc.parent / f"_{sfc.name}.ts", "w") as fp:
                    fp.write(result.group(1).strip())

        # Compile the project
        subprocess.run(
            [
                "npm",
                "exec",
                "--no",
                "--",
                "tsc",
                "--project",
                self.SOURCE_ROOT_DIR,
                "--allowUnusedLabels",
                "--preserveValueImports",
                "--sourceMap",
                "false",
                "--noImplicitUseStrict",
                # We need to set alwaysStrict to false because we truthy in tsconfig. Without it, noImplicitUseStrict will get conflict
                "--alwaysStrict",
                "false",
            ],
            cwd=self.SOURCE_ROOT_DIR,
            stdout=subprocess.DEVNULL,
        )
