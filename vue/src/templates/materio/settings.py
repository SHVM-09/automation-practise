from pathlib import Path
from typing import cast

from pydantic import HttpUrl
from templates.base.settings import BaseConfigSchema


class MaterioConfigSchema(BaseConfigSchema):
    pass


MaterioConfig = MaterioConfigSchema(
    TEMPLATE_NAME="Materio",
    SOURCE_DIR=Path.home()
    / "Projects"
    / "clevision"
    / "materio"
    / "vue"
    / "typescript-version"
    / "full-version",
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
    DOCS_LINK=cast(
        HttpUrl,
        "https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation",
    ),
    CHANGELOG_FILE_RELATIVE_PATH=Path("CHANGELOG.md"),
    GITHUB_REPO_LINK=cast(
        HttpUrl,
        "https://github.com/themeselection/materio-vuetify-vuejs-admin-template",
    ),
)
