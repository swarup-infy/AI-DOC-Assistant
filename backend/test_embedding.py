from app.services.embedding_service import EmbeddingService

service = EmbeddingService()

texts = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning"
]

embeddings = service.create_embeddings(texts)

print("Number of embeddings:", len(embeddings))
print("Embedding dimension:", len(embeddings[0]))
