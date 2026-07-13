from app.services.llm_service import LLMService

llm = LLMService()

response = llm.generate_response(
    question="What is Artificial Intelligence?",
    context="""
Artificial Intelligence (AI) is a branch of computer science
that enables machines to perform tasks that normally require
human intelligence.
"""
)

print(response)