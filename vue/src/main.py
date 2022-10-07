import typer

from templates.master import app as master
from templates.materio import app as materio

# from templates.sneat.typer_app import app as sneat

app = typer.Typer()
app.add_typer(master, name="master", help="Run various Master commands")
app.add_typer(materio, name="materio", help="Run various Materio commands")
# app.add_typer(sneat, name="sneat", help="Run various Sneat commands")


if __name__ == "__main__":
    app()