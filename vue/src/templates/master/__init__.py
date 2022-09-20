from pathlib import Path

import typer
from templates.master.template import Master

app = typer.Typer()


@app.command()
def fill_code_snippets(js: Path | None = None):
    Master().autofill_code_blocks.fill_code_snippets(js)


@app.command()
def convert_to_js():
    Master().ts_converter.convert_to_js()


if __name__ == "__main__":
    app()
