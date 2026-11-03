from __future__ import annotations

from app.routes.chat import (
    _build_rag_context,
    _build_search_filter,
    _cosine_distance_to_similarity,
    _extract_relevant_results,
)
from app.schemas.chat import SourceDocument
from app.services.text_chunker import chunk_text


def test_chunk_text_returns_empty_for_blank_content() -> None:
    assert chunk_text("  \n\t  ") == []


def test_chunk_text_preserves_content_with_overlap() -> None:
    text = " ".join(f"word{i}" for i in range(180))
    chunks = chunk_text(text, chunk_size=120, chunk_overlap=30)

    assert len(chunks) > 1
    assert all(chunk.strip() for chunk in chunks)
    assert chunks[0].startswith("word0")
    assert chunks[-1].endswith("word179")
    assert all(len(chunk) <= 120 for chunk in chunks)


def test_chunk_text_rejects_invalid_overlap() -> None:
    try:
        chunk_text("example text", chunk_size=10, chunk_overlap=10)
    except ValueError as exc:
        assert "smaller than chunk_size" in str(exc)
    else:
        raise AssertionError("Expected invalid overlap to raise ValueError")


def test_search_filter_always_scopes_to_user() -> None:
    assert _build_search_filter(user_id=17, document_id=None) == {"user_id": 17}
    assert _build_search_filter(user_id=17, document_id=42) == {
        "$and": [{"user_id": 17}, {"document_id": 42}]
    }


def test_cosine_distance_is_clamped_to_similarity_range() -> None:
    assert _cosine_distance_to_similarity(0.25) == 0.75
    assert _cosine_distance_to_similarity(-0.5) == 1.0
    assert _cosine_distance_to_similarity(1.5) == 0.0


def test_retrieval_parses_source_metadata_and_applies_threshold(monkeypatch) -> None:
    from app.core.config import settings

    monkeypatch.setattr(settings, "RAG_MIN_SIMILARITY", 0.2)
    results = {
        "documents": [[
            "Useful matching passage",
            "Low relevance passage",
            "Missing metadata passage",
        ]],
        "distances": [[0.1, 0.95, 0.05]],
        "metadatas": [[
            {"document_id": 5, "document_name": "guide.pdf", "page": 3},
            {"document_id": 5, "document_name": "guide.pdf", "page": 4},
            {},
        ]],
    }

    documents, sources = _extract_relevant_results(results)

    assert documents == ["Useful matching passage"]
    assert sources == [
        SourceDocument(
            document_id=5,
            filename="guide.pdf",
            page=3,
            similarity=0.9,
        )
    ]


def test_retrieval_handles_empty_and_malformed_result_sets() -> None:
    assert _extract_relevant_results({}) == ([], [])
    assert _extract_relevant_results({
        "documents": [["passage"]],
        "distances": [["not-a-number"]],
        "metadatas": [[]],
    }) == ([], [])


def test_rag_context_is_bounded_and_marks_history_as_non_evidence() -> None:
    context = _build_rag_context(
        history="previous answer",
        documents=["A" * 26000],
    )

    assert len(context) < 27000
    assert "RETRIEVED DOCUMENT EVIDENCE" in context
    assert "continuity only; not document evidence" in context
    assert "previous answer" in context
