from app.services.extractor import extract_pdf_text


def main():
    text = extract_pdf_text("sample_files/sample.pdf")

    print("\n=== Extracted Text ===\n")
    print(text)


if __name__ == "__main__":
    main()