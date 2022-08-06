from src.templates.base.template import TemplateBase
from src.templates.master.settings import MasterConfig


class Master(TemplateBase):
    def __init__(self):
        super().__init__(MasterConfig)
