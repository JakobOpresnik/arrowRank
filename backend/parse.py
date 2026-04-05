from models import Gender, Category, AgeGroup

def parse_category(category_value: str):
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
    if "gosti" in category_value:
        category = Category.GUEST
    
    # parse gender
    if "ženske" in category_value or "zenske" in category_value or "punce" in category_value:
        gender = Gender.FEMALE
    if "moški" in category_value or "moski" in category_value or "fantje" in category_value:
        gender = Gender.MALE
    
    # parse age group
    if "u11" in category_value:
        age_group = AgeGroup.U11
        gender = Gender.MIXED
    if "u16" in category_value:
        age_group = AgeGroup.U16
        if category == Category.LONG_BOW:
            gender = Gender.MIXED
    
    return category, gender, age_group