import typer
from templates.master.template import Master

app = typer.Typer()


@app.command()
def fill_code_snippets():
    Master().autofill_code_blocks.fill_code_snippets()


if __name__ == "__main__":
    app()
