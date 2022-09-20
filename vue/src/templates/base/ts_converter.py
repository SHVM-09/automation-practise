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

import rapidjson
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

    def update_vite_config(self):
        # Path to vite config
        vite_config_path = self.temp_location.TEMP_DIR / "vite.config.ts"

        # vite config content
        vite_config = vite_config_path.read_text()

        # Replace themeConfig.ts alias to themeConfig.js
        vite_config = vite_config.replace("themeConfig.ts", "themeConfig.js")

        # enable eslintrc in AutoImport plugin
        auto_import_eslint_config = """eslintrc: {
            enabled: true,
            filepath: './.eslintrc-auto-import.json',
        },"""
        vite_config = re.sub(
            r"(AutoImport\({\n(\s+))",
            rf"\g<1>{auto_import_eslint_config}\n\g<2>",
            vite_config,
        )

        # Write back
        vite_config_path.write_text(vite_config)

    def update_eslint_file(self):
        # Confirm the requirements
        typer.confirm(
            "It will remove the settings options from eslint & will remove all lines which contains word 'typescript'",
            abort=True,
        )

        # Path to eslint file
        eslint_file = self.temp_location.TEMP_DIR / ".eslintrc.js"

        vite_config_path = self.temp_location.TEMP_DIR / "vite.config.ts"

        # Add import resolver package
        subprocess.run(
            ["ni", "eslint-import-resolver-alias"], cwd=self.temp_location.TEMP_DIR
        )

        # Read eslint file
        eslint_content = eslint_file.read_text()

        # Remove all the lines which contains word 'typescript' or 'antfu'
        # ℹ️ We will remove line that contains word 'antfu' => We need to remove antfu eslint config as this also add TS rules
        # Thanks: https://stackoverflow.com/a/3389611/10796681
        filtered_content = "\n".join(
            [
                line
                for line in eslint_content.split("\n")
                if not any(i in line.lower() for i in ["typescript", "antfu"])
            ]
        )

        # Remove eslint internal rules
        filtered_content = re.sub(
            r"(\s+// Internal Rules|\s+'valid-appcardcode.*)", "", filtered_content
        )

        # Add auto-import json file in extends array
        # Regex: https://regex101.com/r/1RYdYv/2
        filtered_content = re.sub(
            r"(extends: \[\n(\s+))",
            r"\g<1>'.eslintrc-auto-import.json',\n\g<2>",
            filtered_content,
        )

        # Write back to eslint file
        eslint_file.write_text(filtered_content)

        # Add vite aliases in eslint
        aliases = re.findall(
            r"'(.*)': fileURLToPath\(new URL\('(.*)',.*,", vite_config_path.read_text()
        )

        # settings_dict = {  # type: ignore
        #     "import/resolver": {
        #         "node": {
        #             "extensions": [".js", ".mjs", ".jsx"],
        #         },
        #         "alias": {"map": [list(m) for m in aliases]},
        #     }
        # }
        # settings_str = "settings: " + json.dumps(settings_dict, indent=2) + "\n"
        alias_str = f"alias: {{'extensions': ['.ts', '.js', '.tsx', '.jsx', '.mjs'], 'map': {[list(m) for m in aliases]}}}"

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

    def update_package_json(self):
        # Path to eslint file
        package_json = self.temp_location.TEMP_DIR / "package.json"

        package_json_data = json.loads(package_json.read_text())

        # Remove "typecheck" script
        package_json_data["scripts"].pop("typecheck")

        # Remove "build:icons" script
        package_json_data["scripts"].pop("build:icons")

        # Remove build:icons & vue-tsc --noEmit & ` --rulesdir eslint-internal-rules/` from all scripts
        package_json_data["scripts"] = {
            name: re.sub(
                r"( --rulesdir eslint-internal-rules/|npm run build:icons && | && npm run build:icons|vue-tsc --noEmit && | && vue-tsc --noEmit)",
                "",
                command,
            )
            for name, command in package_json_data["scripts"].items()
        }

        # Remove typescript packages
        package_json_data["devDependencies"] = dict(
            filter(
                lambda item: "type" not in item[0],
                package_json_data["devDependencies"].items(),
            )
        )

        # Write back to package.json
        package_json.write_text(json.dumps(package_json_data, indent=2, sort_keys=True))

    def update_index_html(self):
        index_html_path = self.temp_location.TEMP_DIR / "index.html"

        # Replace main.ts with main.js
        index_html_path.write_text(
            index_html_path.read_text().replace("main.ts", "main.js")
        )

    def gen_jsconfig(self):
        """Generate jsconfig from tsconfig"""

        tsconfig_path = self.temp_location.TEMP_DIR / "tsconfig.json"
        tsconfig = tsconfig_path.read_text()
        tsconfig = tsconfig.replace(".ts", ".js")

        ts_config = rapidjson.loads(
            tsconfig_path.read_text(),
            parse_mode=rapidjson.PM_COMMENTS | rapidjson.PM_TRAILING_COMMAS,
        )

        js_config_compiler_options = [
            "noLib",
            "target",
            "module",
            "moduleResolution",
            "checkJs",
            "experimentalDecorators",
            "allowSyntheticDefaultImports",
            "baseUrl",
            "paths",
            "jsx",
            "types",
        ]
        config = {
            # Except 'env.d.ts' replace all .ts files with .js files
            "include": [s for s in ts_config["include"] if s != "env.d.ts"],
            "exclude": ts_config["exclude"],
            "compilerOptions": {
                k: v
                for (k, v) in ts_config["compilerOptions"].items()
                if k in js_config_compiler_options
            },
        }
        (self.temp_location.TEMP_DIR / "jsconfig.json").write_text(
            json.dumps(config, indent=2, sort_keys=True)
        )

        # Remove tsconfig as it isn't required in JS project
        tsconfig_path.unlink()

    def remove_eslint_internal_rules(self):
        # Remove eslint internal rules
        shutil.rmtree(self.temp_location.TEMP_DIR / "eslint-internal-rules")

        vs_code_config_path = self.temp_location.TEMP_DIR / ".vscode" / "settings.json"
        vs_code_config = rapidjson.loads(
            vs_code_config_path.read_text(),
            parse_mode=rapidjson.PM_COMMENTS | rapidjson.PM_TRAILING_COMMAS,
        )
        vs_code_config["eslint.options"].pop("rulePaths")
        vs_code_config_path.write_text(
            json.dumps(vs_code_config, indent=2, sort_keys=True)
        )

        # ℹ️ rules from `.eslintrc` is removed in `update_eslint_file` method

    def convert_to_js(self):
        # copy the source to temp dir
        self.copy_project_files_to_temp_dir()

        # Update vite config to enable eslintrc for auto-import
        self.update_vite_config()

        # ❗ `update_eslint_file` must be called after `update_vite_config`
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

        self.update_package_json()

        self.update_index_html()

        # create [jsconfig.json](https://code.visualstudio.com/docs/languages/jsconfig) for vscode
        self.gen_jsconfig()

        # Remove eslint internal rules from dir & .vscode dir
        self.remove_eslint_internal_rules()

        # Run build command to generate auto-imports.d.ts and other definition file to mitigate the ESLint errors in next step
        subprocess.run(
            [
                "na",
                "build",
            ],
            cwd=self.temp_location.TEMP_DIR,
        )

        # Remove typescript eslint comments from tsx/ts files
        # grep -r "@typescript-eslint" ./src | cut -d: -f1
        # https://stackoverflow.com/a/39382621/10796681
        subprocess.run(
            r"find ./src \( -iname \*.vue -o -iname \*.js -o -iname \*.jsx \) -type f | xargs sed -i '' -e '/@typescript-eslint/d'",
            cwd=self.temp_location.TEMP_DIR,
            shell=True,
        )

        subprocess.run(
            ["nr", "lint"],
            cwd=self.temp_location.TEMP_DIR,
        )

        # subprocess.run(["git", "init"], cwd=self.temp_location.TEMP_DIR)
        # subprocess.run(["git", "add", "."], cwd=self.temp_location.TEMP_DIR)
        # subprocess.run(
        #     ["git", "commit", "-m", "init"],
        #     cwd=self.temp_location.TEMP_DIR,
        # )
