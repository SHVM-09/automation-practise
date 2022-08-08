from src.utils import to_camel_case


def test_to_camel_case():
    assert to_camel_case("PythonIsAwesome") == "pythonIsAwesome"
    assert to_camel_case("Python_is-awesome") == "pythonIsAwesome"
    assert to_camel_case("Python_isAwesome") == "pythonIsAwesome"
    assert to_camel_case("Python_is-Awesome") == "pythonIsAwesome"
    assert to_camel_case("PythonIs-Awesome") == "pythonIsAwesome"
    assert to_camel_case("PythonIs_Awesome") == "pythonIsAwesome"
    assert to_camel_case("Python Is Awesome") == "pythonIsAwesome"
    assert to_camel_case("Python_Is_Awesome") == "pythonIsAwesome"
    assert to_camel_case("Python-Is-Awesome") == "pythonIsAwesome"
    assert to_camel_case("pythonIsAwesome") == "pythonIsAwesome"

    assert to_camel_case("pythonIsAwesome004") == "pythonIsAwesome004"
    assert to_camel_case("pythonIs004Awesome") == "pythonIs004Awesome"
    assert to_camel_case("pythonIAwesome") == "pythonIAwesome"

    assert to_camel_case("python isAwesome") == "pythonIsAwesome"
    assert to_camel_case("pythonIs awesome") == "pythonIsAwesome"
    assert to_camel_case("python Is awesome") == "pythonIsAwesome"
    assert to_camel_case("python IsAwesome") == "pythonIsAwesome"
    assert to_camel_case("python is awesome") == "pythonIsAwesome"
    assert to_camel_case("python is-awesome") == "pythonIsAwesome"
    assert to_camel_case("python is -awesome") == "pythonIsAwesome"
    assert to_camel_case("python- is -awesome") == "pythonIsAwesome"
    assert to_camel_case("python- -is-0 -awesome") == "pythonIs0Awesome"
    assert to_camel_case("python isawesome") == "pythonIsawesome"
