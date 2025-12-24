from translations import AGE_GROUP_TRANSLATIONS, CATEGORY_TRANSLATIONS, GENDER_TRANSLATIONS
from models import Gender, Category, AgeGroup, Language

def parse_category(category_value: str, language: Language):
    print("language: ", language.value)

    # convert to lower-case
    category_value = category_value.lower().strip()

    # default values
    category = Category.GUEST
    gender = Gender.MIXED
    age_group = AgeGroup.ADULTS
    
    # parse category
    if "goli" in category_value:
        category = Category.BAREBOW
    if "dolgi" in category_value:
        category = Category.LONG_BOW
    if "tradicionalni" in category_value:
        category = Category.TRADITIONAL_BOW
    if "primitivni" in category_value:
        category = Category.PRIMITIVE_BOW
        gender = Gender.MIXED
    if "gosti" in category_value:
        category = Category.GUEST
        gender = Gender.MIXED
    
    # parse gender
    if "ženske" in category_value or "zenske" in category_value or "punce" in category_value:
        gender = Gender.FEMALE
    if "moški" in category_value or "moski" in category_value or "fantje" in category_value:
        gender = Gender.MALE
    
    # parse age group
    if "u10" in category_value:
        age_group = AgeGroup.U10
        gender = Gender.MIXED
    if "u15" in category_value:
        age_group = AgeGroup.U15

    # map category
    # for key, enum_val in CATEGORY_TRANSLATIONS[language].items():
    #     if key in category_value:
    #         category = enum_val
    #         break

    # # map gender
    # for key, enum_val in GENDER_TRANSLATIONS[language].items():
    #     if key in category_value:
    #         gender = enum_val
    #         break

    # # map age group
    # for key, enum_val in AGE_GROUP_TRANSLATIONS[language].items():
    #     if key in category_value:
    #         age_group = enum_val
    #         break

    # print(f"Parsed category: {category}, gender: {gender}, age_group: {age_group} from value: '{category_value}'")

    return category, gender, age_group