from pytest import CaptureFixture
from src.main import app
from typer.testing import CliRunner

runner = CliRunner()


def test_app(capsys: CaptureFixture[str]):
    result = runner.invoke(app, ['master', 'fill-code-snippets'])
    assert result.exit_code == 0
    with capsys.disabled():
        print(f"result.stdout: {result.stdout}")
