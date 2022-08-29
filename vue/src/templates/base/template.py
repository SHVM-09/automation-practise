import shutil
import subprocess
import tempfile
from abc import ABC
from functools import partial
from pathlib import Path
from random import randint

from .autofill_code_snippets import AutoFillCodeSnippets
from .settings import BaseConfigSchema
from .ts_converter import TsConverter


class TempLocation:
    SYS_TEMP_DIR = Path(tempfile.gettempdir())

    def __init__(self) -> None:
        self.TEMP_DIR = self.SYS_TEMP_DIR / f"template-{randint(0, 100)}"

    def remove_temp_dir(self):
        """Removes temporary created during initialization"""

        shutil.rmtree(self.TEMP_DIR)


class TemplateBase(ABC):
    """This class is created with intention of all derived class will be vue templates"""

    def __init__(self, config: BaseConfigSchema) -> None:
        self.temp_location = TempLocation()
        self.config = config

        # Composition over inheritance
        self.autofill_code_blocks = AutoFillCodeSnippets(self.config.SOURCE_DIR)
        self.ts_converter = TsConverter(self.config)
        # self.subprocess_run = partial(
        #     subprocess.run, cwd=self.temp_location.TEMP_DIR, check=True
        # )
