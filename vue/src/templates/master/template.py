from templates.base.template import TemplateBase
from templates.master.settings import MasterConfig


class Master(TemplateBase):
    def __init__(self):
        super().__init__(MasterConfig)
