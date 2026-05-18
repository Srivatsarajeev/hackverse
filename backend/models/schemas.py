from pydantic import BaseModel, EmailStr, Field

class ParticipantRegisterSchema(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    whatsapp: str = Field(..., min_length=7, max_length=20)
    alternatePhoneSame: bool = Field(True)
    alternatePhone: str = Field("", max_length=20)
    dob: str = Field(..., description="Date of Birth in YYYY-MM-DD")
    gender: str = Field(..., description="Male, Female, Other, Prefer not to say")
    country: str = Field("India")
    state: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    occupation: str = Field("College Student")
    collegeName: str = Field(..., min_length=2)
    collegeCountry: str = Field("India")
    collegeState: str = Field(...)
    collegeCity: str = Field(...)
    degree: str = Field(..., min_length=2)
    stream: str = Field(..., min_length=2)
    passoutYear: str = Field(..., description="Graduation year e.g. 2026")
    githubUrl: str = Field(..., description="Valid GitHub URL")
    linkedinUrl: str = Field(..., description="Valid LinkedIn URL")
    termsAccepted: bool = Field(True)
    communicationsAccepted: bool = Field(True)


class AdminLoginSchema(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
