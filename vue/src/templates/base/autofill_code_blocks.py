from pathlib import Path


class AutoFillCodeBlocks:
    def __init__(self, source_dir: str | Path):
        self.source_dir = Path(source_dir)
        print(f"autofill code blocks")
