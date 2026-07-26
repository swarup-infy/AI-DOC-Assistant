from app.services.embedding_service import EmbeddingService


def main():
    service = EmbeddingService()

    texts = [
        "Artificial Intelligence",
        "Machine Learning",
        "Deep Learning",
    ]

    embeddings = service.create_embeddings(texts)

    print(f"Texts: {len(texts)}")
    print(f"Embeddings Generated: {len(embeddings)}")
    print(f"Embedding Dimension: {len(embeddings[0])}")


if __name__ == "__main__":
    main()