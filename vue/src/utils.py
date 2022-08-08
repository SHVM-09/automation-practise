import re


def pascal_case_to_camel_case(string: str) -> str:
    return string[0].lower() + string[1:]


def to_camel_case(string: str) -> str:
    string = string.strip()

    """
        Replace `_` & `-` with space

        this-is => this is
        this_is => this_is
        this is => this is
        thisIs => thisIs
    """
    wo_slash_underscore = re.sub(r"([_-])+", " ", string)

    """
        Add space before capital letters

        thisIs => this Is
        ThisIs => ' This Is'
        this-is => this-is
        this => 'this'
        This => ' This'

        Later on strip() removes the space around the string
    """
    space_before_capital = re.sub(r"([A-Z])", r" \1", wo_slash_underscore).strip()

    """
        Call title method. Capitalize first char after space.

        this is => This Is
        this Is => This Is
        This is => This Is
        This Is => This Is
    """
    titled = space_before_capital.title()

    """
        Remove space between words

        This Is => ThisIs
    """
    pascal_cased = titled.replace(" ", "")

    return pascal_case_to_camel_case(pascal_cased)
