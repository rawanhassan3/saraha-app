const errors = {
    invalidEmail: {
        en: "This is invalid email, please enter email like this example@test.try",
        ar: "البريد الإلكتروني غير صحيح"
    },

    fullName: {
        en: "Full name must be like name1 name2",
        ar: "يجب أن يكون الاسم مثل name1 name2"
    },

    wrongPhoneNumber: {
        en: "This is invalid phone number, please enter a phone number like this 01xxxxxxxxx",
        ar: "رقم الهاتف غير صحيح"
    },

    invalidObjectId: {
        en: "Invalid object id",
        ar: "معرف المستخدم غير صحيح"
    },

    invalidGender: {
        en: "Gender must be male or female",
        ar: "النوع يجب أن يكون ذكر أو أنثى"
    },

    invalidLanguage: {
        en: "Language must be ar or en",
        ar: "اللغة يجب أن تكون ar أو en"
    }
};

export const getErrorMessage = (
    errorCode,
    lang = "en"
) => {
    return (
        errors[errorCode]?.[lang] ||
        errors[errorCode]?.en ||
        "Validation error"
    );
};

export default errors;