import concurrent.futures
import itertools
import json
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from random import randint

import typer
from rich.console import Console

# Rich
from rich.syntax import Syntax

from .settings import BaseConfigSchema


class TempLocation:
    SYS_TEMP_DIR = Path(tempfile.gettempdir())

    def __init__(self) -> None:
        self.TEMP_DIR = self.SYS_TEMP_DIR / f"template-{randint(0, 100)}"

    def remote_temp_dir(self):
        """Removes temporary created during initialization"""

        shutil.rmtree(self.TEMP_DIR)


class TsConverter:
    def __init__(self, config: BaseConfigSchema):
        self.SOURCE_ROOT_DIR = Path(config.SOURCE_DIR)
        self.SRC_DIR = self.SOURCE_ROOT_DIR / "src"
        self.temp_location = TempLocation()
        self.config = config
        self.REGEX_SCRIPT_TAG = r"<script.*>(\n|.)*</script>"

    def update_eslint_file(self):
        # Confirm the requirements
        typer.confirm(
            "It will remove the settings options from eslint & will remove all lines which contains word 'typescript'",
            abort=True,
        )

        # Path to eslint file
        eslint_file = self.temp_location.TEMP_DIR / ".eslintrc.js"

        # Path to vite config
        vite_config_file = self.temp_location.TEMP_DIR / "vite.config.ts"

        # Add import resolver package
        subprocess.run(
            ["ni", "eslint-import-resolver-alias"], cwd=self.temp_location.TEMP_DIR
        )

        # Replace themeConfig.ts alias to themeConfig.js
        vite_config_file.write_text(
            vite_config_file.read_text().replace("themeConfig.ts", "themeConfig.js")
        )

        # Read eslint file
        eslint_content = eslint_file.read_text()

        # Remove all the lines which contains word 'typescript'
        filtered_content = [
            line
            for line in eslint_content.split("\n")
            if "typescript" not in line.lower()
        ]

        # Write back to eslint file
        eslint_file.write_text("\n".join(filtered_content))

        # Add vite aliases in eslint
        vite_config = (self.temp_location.TEMP_DIR / "vite.config.ts").read_text()
        aliases = re.findall(r"'(.*)': fileURLToPath\(new URL\('(.*)',.*,", vite_config)
        # settings_dict = {  # type: ignore
        #     "import/resolver": {
        #         "node": {
        #             "extensions": [".js", ".mjs", ".jsx"],
        #         },
        #         "alias": {"map": [list(m) for m in aliases]},
        #     }
        # }
        # settings_str = "settings: " + json.dumps(settings_dict, indent=2) + "\n"
        alias_str = f"alias: {{'map': {[list(m) for m in aliases]}}}"

        # Add settings in eslint config file
        eslint_file.write_text(
            re.sub(
                r"(module\.exports = {(\n|.)*\s{6}},)((\n|.)*)",
                rf"\1{alias_str}\3",
                eslint_file.read_text(),
            )
        )

    def copy_project_files_to_temp_dir(self):
        """Copy project files excluding ignore patterns to temp location"""

        shutil.copytree(
            self.SOURCE_ROOT_DIR,
            self.temp_location.TEMP_DIR,
            ignore=shutil.ignore_patterns(
                *self.config.PACKAGE_IGNORE_PATTERNS_FROM_SOURCE
            ),
        )

    def convert_sfc_ts_to_sfc_js(self, file: Path):
        typer.secho(f"file: {file}", fg=typer.colors.BRIGHT_CYAN)
        try:
            # na tsx sfc-to-js.ts /Users/jd/Projects/experiments/vue-sfc-to-js/assets/Test.vue
            completed_process = subprocess.run(
                [
                    "na",
                    "tsx",
                    "sfc-to-js.ts",
                    file,
                    f"{self.SOURCE_ROOT_DIR / '.eslintrc.js'}",
                ],
                cwd="/Users/jd/Projects/experiments/vue-sfc-to-js",
                capture_output=True,
                text=True,
                check=True,
            )

            converted_script = completed_process.stdout.strip() or None

            if converted_script and completed_process.returncode == 0:

                # print(f"{converted_script}")
                console = Console()
                print()
                console.print(Syntax(converted_script, "html", theme="dracula"))
                print()
                print()

                # Replace script tag content with converted script
                file.write_text(
                    re.sub(self.REGEX_SCRIPT_TAG, converted_script, file.read_text())
                )
            else:
                typer.secho(completed_process.stderr, fg=typer.colors.BRIGHT_RED)
        except subprocess.CalledProcessError as e:
            print(f"stdout: {e.stdout}")
            typer.secho(e.stderr, fg=typer.colors.BRIGHT_RED)
            raise

    def convert_to_js(self):
        # copy the source to temp dir
        self.copy_project_files_to_temp_dir()

        # Remove TypeScript stuff from eslint
        self.update_eslint_file()

        # TODO: Remove typescript packages from package.json

        # init git
        # subprocess.run(["git", "init"], cwd=self.temp_location.TEMP_DIR)
        # subprocess.run(["git", "add", "."], cwd=self.temp_location.TEMP_DIR)
        # subprocess.run(
        #     ["git", "commit", "-m", "init"],
        #     cwd=self.temp_location.TEMP_DIR,
        # )

        """
            ℹ️ Now we will generate the js & jsx files from ts & tsx files
            But for this we need some changes in our jsconfig file:
                1. disable source maps
        """
        tsconfig_path = self.temp_location.TEMP_DIR / "tsconfig.json"

        # Generate Dict
        tsconfig_as_dict = json.loads(tsconfig_path.read_text())

        # # Disable source map
        tsconfig_as_dict["compilerOptions"]["sourceMap"] = False

        # # Write back json
        tsconfig_path.write_text(json.dumps(tsconfig_as_dict, indent=4))

        subprocess.run(
            ["ni"],
            cwd=self.temp_location.TEMP_DIR,
        )

        subprocess.run(
            [
                "na",
                "tsc",
                "--project",
                self.temp_location.TEMP_DIR / "tsconfig.json",
            ],
            cwd=self.temp_location.TEMP_DIR,
        )

        # Remove tsconfig as it isn't required in JS project
        tsconfig_path.unlink()

        # Remove all the ts files
        for file in itertools.chain(
            self.temp_location.TEMP_DIR.rglob("*.ts"),
            self.temp_location.TEMP_DIR.rglob("*.tsx"),
        ):
            file.unlink()

        start = time.perf_counter()
        # Convert SFC
        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(
                self.convert_sfc_ts_to_sfc_js,
                (self.temp_location.TEMP_DIR / "src").rglob("*.vue"),
            )
        # for file in (self.temp_location.TEMP_DIR / "src").rglob("*.vue"):
        #     self.convert_sfc_ts_to_sfc_js(file)

        finish = time.perf_counter()
        print(f"Finished in {round(finish-start, 2)} second(s)")

        subprocess.run(
            ["nr", "lint"],
            cwd=self.temp_location.TEMP_DIR,
        )

        # TODO: Need to remove build icons commands and its usage
        # devDependencies => "types".startswith & vue-tsc
        # remove script
        # build:icons
        # typecheck
        # from build => Remove "vue-tsc --noEmit && "
        # Need to change main.ts to main.js in index.html as well

        # TODO: create jsconfig.json
