import shutil
import subprocess
import tempfile
from pathlib import Path
from random import randint

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

    def copy_project_files_to_temp_dir(self):
        """Copy project files excluding ignore patterns to temp location"""

        shutil.copytree(
            self.SOURCE_ROOT_DIR,
            self.temp_location.TEMP_DIR,
            ignore=shutil.ignore_patterns(
                *self.config.PACKAGE_IGNORE_PATTERNS_FROM_SOURCE
            ),
        )

    def convert_sfc_ts_to_sfc_js(self):
        for file in (self.temp_location.TEMP_DIR).rglob("src/**/*.vue"):
            print(f"file: {file}")
            # na tsx sfc-to-js.ts /Users/jd/Projects/experiments/vue-sfc-to-js/assets/Test.vue
            try:
                subprocess.run(
                    [
                        "na",
                        "tsx",
                        "sfc-to-js.ts",
                        file,
                    ],
                    cwd="/Users/jd/Projects/experiments/vue-sfc-to-js",
                )
            except subprocess.CalledProcessError as e:
                print("fucked.........!!!!!!!!!!")

    def convert_to_js(self):
        # copy the source to temp dir
        self.copy_project_files_to_temp_dir()

        self.convert_sfc_ts_to_sfc_js()
