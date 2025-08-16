// pages/FolderView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  db,
  storage,
  DB_ID,
  COLLECTION_FILES,
  QueryHelper,
  IDHelper,
  BUCKET_ID,
} from "../utils/appwrite";
import "./page.css";

export default function FolderView() {
  const { id } = useParams();
  const username = localStorage.getItem("username");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [id]);

  const fetchFiles = async () => {
    try {
      const result = await db.listDocuments(DB_ID, COLLECTION_FILES, [
        QueryHelper.equal("folderId", id),
        QueryHelper.equal("owner", username),
      ]);
      setFiles(result.documents);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploaded = await storage.createFile(
        BUCKET_ID,
        IDHelper.unique(),
        file
      );

      await db.createDocument(DB_ID, COLLECTION_FILES, IDHelper.unique(), {
        fileId: uploaded.$id,
        fileName: file.name,
        fileType: file.type || "unknown",
        folderId: id,
        owner: username,
      });

      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const getFileThumbnail = (file) => {
    const fileType = file.fileType || "";

    try {
      if (fileType.startsWith("image/")) {
        const thumbUrl = storage
          .getFilePreview(BUCKET_ID, file.fileId, 200, 150)
          .toString();
        return (
          <img
            src={thumbUrl}
            alt={file.fileName}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/200x150?text=No+Preview";
            }}
          />
        );
      } else if (fileType === "application/pdf") {
        const pdfThumb = storage
          .getFilePreview(BUCKET_ID, file.fileId, 200, 150)
          .toString();
        return (
          <img
            src={pdfThumb}
            alt="PDF Preview"
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/200x150?text=PDF";
            }}
          />
        );
      } else {
        return (
          <div
            style={{
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "#555",
            }}
          >
            📄
          </div>
        );
      }
    } catch (err) {
      console.error("Thumbnail error:", err);
      return (
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: "#999",
          }}
        >
          ❌
        </div>
      );
    }
  };

  const getFileViewer = (file) => {
    const fileType = file.fileType || "";
    const fileUrl = storage.getFileView(BUCKET_ID, file.fileId).toString();

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={file.fileName}
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            borderRadius: "8px",
          }}
        />
      );
    } else if (fileType === "application/pdf") {
      return (
        <iframe
          src={fileUrl}
          title={file.fileName}
          style={{
            width: "80vw",
            height: "80vh",
            border: "none",
            borderRadius: "8px",
          }}
        />
      );
    } else {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "16px",
            color: "#007bff",
            textDecoration: "underline",
          }}
        >
          Download {file.fileName}
        </a>
      );
    }
  };

  return (
    <div className="folder-view-container">
      <h1>Files</h1>

      <div className="file-uploader-container">
        <label className="file-uploader">
          Upload File
          <input
            type="file"
            style={{ display: "none" }}
            onChange={uploadFile}
          />
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {files.map((file) => (
          <div
            key={file.$id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedFile(file)}
          >
            {getFileThumbnail(file)}
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {file.fileName}
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSelectedFile(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ❌
            </button>
            {getFileViewer(selectedFile)}
          </div>
        </div>
      )}
    </div>
  );
}
