from app.core.config import settings


def main():
    print(f"App Name      : {settings.APP_NAME}")
    print(f"LLM Provider  : {settings.LLM_PROVIDER}")
    print(f"Groq Model    : {settings.GROQ_MODEL}")

    if settings.GROQ_API_KEY:
        print(f"Groq API Key  : {settings.GROQ_API_KEY[:10]}...")
    else:
        print("Groq API Key  : NOT SET")


if __name__ == "__main__":
    main()