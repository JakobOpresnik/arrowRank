from models import AgeGroup, Category, Gender, Language

CATEGORY_TRANSLATIONS = {
    Language.SL: {
        'goli lok': Category.BAREBOW,
        'dolgi lok': Category.LONG_BOW,
        'tradicionalni lok': Category.TRADITIONAL_BOW,
        'primitivni lok': Category.PRIMITIVE_BOW,
        'gosti': Category.GUEST,
    },
    Language.EN: {
        'barebow': Category.BAREBOW,
        'long bow': Category.LONG_BOW,
        'traditional bow': Category.TRADITIONAL_BOW,
        'primitive bow': Category.PRIMITIVE_BOW,
        'guest': Category.GUEST,
    }
}

GENDER_TRANSLATIONS = {
    Language.SL: {
        'moški': Gender.MALE,
        'ženske': Gender.FEMALE,
        'mešano': Gender.MIXED,
    },
    Language.EN: {
        'male': Gender.MALE,
        'female': Gender.FEMALE,
        'mixed': Gender.MIXED,
    }
}

AGE_GROUP_TRANSLATIONS = {
    Language.SL: {
        'u10': AgeGroup.U10,
        'u15': AgeGroup.U15,
        'odrasli': AgeGroup.ADULTS,
    },
    Language.EN: {
        'u10': AgeGroup.U10,
        'u15': AgeGroup.U15,
        'adults': AgeGroup.ADULTS,
    }
}