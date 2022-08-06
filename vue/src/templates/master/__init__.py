import typer
from src.templates.master.template import Master

app = typer.Typer()

@app.command()
def fill_code_snippets():
    Master()

if __name__ == "__main__":
    app()
