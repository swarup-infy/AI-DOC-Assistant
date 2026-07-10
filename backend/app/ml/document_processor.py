import fitz


def extract_text_from_pdf(file_path: str):
    text = ""

    with fitz.open(file_path) as document:
        for page_num in range(document.page_count):
            page = document.load_page(page_num)
            text += page.get_text()

    return text
    