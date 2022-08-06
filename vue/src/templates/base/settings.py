from pathlib import Path

from pydantic import BaseModel, HttpUrl


class BaseConfigSchema(BaseModel):
    # name of the template
    TEMPLATE_NAME: str

    # dir path of the template source code
    SOURCE_DIR: Path

    # dir which holds all automation related data
    # AUTOMATION_DATA_DIR: Path

    # ignore pattern for ignoring files while copying source code to temp dir
    PACKAGE_IGNORE_PATTERNS_FROM_SOURCE: list[str]

    # regex for finding `publicPath` property in `vue.config.js`
    # FIND_PUBLIC_PATH_REGEX: str

    # regex for replacing `publicPath` property in `vue.config.js`
    # REPLACE_PUBLIC_PATH_REGEX: str

    # regex for finding `lintOnSave` property in `vue.config.js`
    # FIND_LINT_ON_SAVE_REGEX: str

    # regex for replacing `lintOnSave` property in `vue.config.js`
    # REPLACE_LINT_ON_SAVE_REGEX: str

    # docs link for adding it in documentation.html file
    DOCS_LINK: HttpUrl

    # changelog file path relative to `SOURCE_DIR_PATH`
    CHANGELOG_FILE_RELATIVE_PATH: Path

    # GitHub repo URL
    GITHUB_REPO_LINK: HttpUrl
