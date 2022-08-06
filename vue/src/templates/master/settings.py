from pathlib import Path
from typing import cast

from pydantic import HttpUrl
from templates.base.settings import BaseConfigSchema


class MasterConfigSchema(BaseConfigSchema):
    pass

MasterConfig = MasterConfigSchema(
    TEMPLATE_NAME="Master",
    SOURCE_DIR=Path.home() / "Projects" / "clevision" / "master" / "vue",
    PACKAGE_IGNORE_PATTERNS_FROM_SOURCE=[
        # Directories
        "dist",
        "docs",
        "scripts",
        ".git",
        ".github",
        "node_modules",
        # ".vscode",
        
        # Files
        "LICENSE.md",
        "license.md",
        "yarn-error.log",
        "*.zip",
    ],
    DOCS_LINK=cast(HttpUrl, "https://google.com"),
    CHANGELOG_FILE_RELATIVE_PATH=Path("CHANGELOG.md"),
    GITHUB_REPO_LINK=cast(HttpUrl, "https://github.com/themeselection/master-vue--material")
)
