from app.services.extractor import extract_pdf_text

text = extract_pdf_text("sample_files/sample.pdf")

print(text)
