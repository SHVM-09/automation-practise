from templates.base.template import TemplateBase
from templates.materio.settings import MaterioConfig


class Materio(TemplateBase):
    def __init__(self):
        super().__init__(MaterioConfig)
