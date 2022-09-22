from pathlib import Path

import typer
from templates.materio.template import Materio

app = typer.Typer()


@app.command()
def fill_code_snippets(js: Path | None = None):
    Materio().autofill_code_blocks.fill_code_snippets(js)


@app.command()
def convert_to_js():
    Materio().ts_converter.convert_to_js()


if __name__ == "__main__":
    app()
