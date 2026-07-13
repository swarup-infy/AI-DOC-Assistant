from app.core.config import settings

print("App Name:", settings.APP_NAME)
print("Gemini Key:", settings.GEMINI_API_KEY[:10] + "...")