def save_uploaded_file(file: UploadFile):
    file_path = UPLOAD_DIR / file.filename

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Step 1: Extract text
    extracted_text = extract_text(str(file_path))

    # Step 2: Clean text
    cleaned_text = clean_text(extracted_text)

    # Step 3: Split into chunks
    chunks = chunk_text(cleaned_text)

    # Step 4: Return everything
    return {
        "file_path": file_path,
        "text": cleaned_text,
        "total_chunks": len(chunks),
        "chunks": chunks
    }