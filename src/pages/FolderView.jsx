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
  BUCKET_ID
} from "../utils/appwrite";
import "./page.css";

export default function FolderView() {
  const { id } = useParams();
  const username = localStorage.getItem("username");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, [id]);

  const fetchFiles = async () => {
    try {
      const result = await db.listDocuments(DB_ID, COLLECTION_FILES, [
        QueryHelper.equal("folderId", id),
        QueryHelper.equal("owner", username)
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
        owner: username
      });

      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const getFilePreview = (file) => {
    const fileType = file.fileType || "";
    let fileUrl;

    try {
      fileUrl = storage.getFileView(BUCKET_ID, file.fileId).href;
    } catch (err) {
      console.error("Error generating file URL:", err);
      return null;
    }

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={file.fileName}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            borderRadius: "4px"
          }}
        />
      );
    } else if (fileType === "application/pdf") {
      return (
        <iframe
          src={fileUrl}
          title={file.fileName}
          style={{
            width: "100%",
            height: "150px",
            border: "none",
            borderRadius: "4px"
          }}
        />
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "150px",
            backgroundColor: "#eee",
            borderRadius: "4px"
          }}
        >
          <span style={{ fontSize: "12px", color: "#555" }}>
            📄 {file.fileName || "Unknown File"}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="folder-view-container">
      <h1 >Files</h1>

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
          marginTop: "20px"
        }}
      >
        {files.map((file) => (
          <div
            key={file.$id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "10px"
            }}
          >
            {getFilePreview(file)}
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                textAlign: "center",
                wordBreak: "break-word"
              }}
            >
              {file.fileName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
