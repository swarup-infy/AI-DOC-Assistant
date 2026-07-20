import { useEffect, useRef, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import DocumentTable from "../../components/documents/DocumentTable";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../../services/documentService";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const response = await getDocuments();

      if (response.documents) {
        setDocuments(response.documents);
      } else {
        setDocuments(response);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function chooseFile() {
    inputRef.current?.click();
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (
      e.target.files &&
      e.target.files.length > 0
    ) {
      setSelectedFile(e.target.files[0]);
      setMessage("");
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Please select a file.");
      return;
    }

    try {
      setLoading(true);

      const result =
        await uploadDocument(selectedFile);

      setMessage(result.message);

      await loadDocuments();

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(
    id: number
  ) {
    try {
      await deleteDocument(id);

      await loadDocuments();

      setMessage(
        "Document deleted successfully."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to delete document."
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">

        <h1 className="text-4xl font-bold mb-2">
          Upload Documents
        </h1>

        <p className="text-gray-500 mb-8">
          Upload PDF, DOCX, CSV or Excel files.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">

          <input
            ref={inputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />

          <button
            onClick={chooseFile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Choose File
          </button>

          {selectedFile && (
            <div className="rounded-lg border bg-slate-50 p-4">

              <p className="font-semibold">
                {selectedFile.name}
              </p>

              <p className="text-sm text-gray-500">
                {(
                  selectedFile.size / 1024
                ).toFixed(2)}{" "}
                KB
              </p>

            </div>
          )}

          <button
            disabled={loading}
            onClick={handleUpload}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading
              ? "Uploading..."
              : "Upload"}
          </button>

          {message && (
            <div className="rounded-lg bg-slate-100 p-4">
              {message}
            </div>
          )}

        </div>

        <DocumentTable
          documents={documents}
          onDelete={handleDelete}
        />

      </div>
    </DashboardLayout>
  );
}