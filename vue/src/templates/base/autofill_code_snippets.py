import fileinput
import re
from pathlib import Path

from utils import to_camel_case


class AutoFillCodeSnippets:
    def __init__(self, source_dir: str | Path):
        self.SOURCE_DIR = Path(source_dir)

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

    def fill_code_snippets(self):

        # Find snippet files
        for snippet_file in (self.SOURCE_DIR / "src").rglob("demoCode*.ts"):

            # Directory while hold all the snippets. E.g. Alert dir which has all the demos along with code snippet file
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

                    # Get the demo code
                    DEMO_CONTENT = demo.read_text()

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
                        f"""export const {DEMO_VAR_NAME} = {{ ts: `{DEMO_CONTENT}`, js: `` }}""",
                        snippet_file_content,
                    )

                # Finally, when all demos are injected in file content use it to update the snippet file
                snippet_file_fp.write(snippet_file_content)
