import shutil
import tempfile
from abc import ABC
from pathlib import Path
from random import randint

from .settings import BaseConfigSchema
from .autofill_code_blocks import AutoFillCodeBlocks


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

        print(f"self.config: {self.config}")

        # Composition over inheritance
        self.autofill_code_blocks = AutoFillCodeBlocks(self.config.SOURCE_DIR)
