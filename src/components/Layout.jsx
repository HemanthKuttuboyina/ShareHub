// components/Layout.jsx
import  { useEffect, useState } from "react";
import { db, DB_ID, COLLECTION_FOLDERS,COLLECTION_FILES, QueryHelper, IDHelper } from "../utils/appwrite";
import { isLoggedIn, logoutUser } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import "../pages/page.css"

export default function Layout({ children }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const result = await db.listDocuments(DB_ID, COLLECTION_FOLDERS, [
      QueryHelper.equal("owner", username)
    ]);
    setFolders(result.documents);
  };

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await db.createDocument(DB_ID, COLLECTION_FOLDERS, IDHelper.unique(), {
      name: newFolderName,
      owner: username
    });
    setNewFolderName("");
    fetchFolders();
  };
  const deleteFolder = async (folderId) => {
  try {
    // 1. Get all files in this folder
    const filesInFolder = await db.listDocuments(DB_ID, COLLECTION_FILES, [
      QueryHelper.equal("folderId", folderId)
    ]);

    // 2. Delete each file from storage & DB
    for (const file of filesInFolder.documents) {
      try {
        await storage.deleteFile(BUCKET_ID, file.fileId); // delete from storage
      } catch (err) {
        console.warn(`Storage file not found for ${file.fileName}`);
      }
      await db.deleteDocument(DB_ID, COLLECTION_FILES, file.$id); // delete doc
    }

    // 3. Delete folder document itself
    await db.deleteDocument(DB_ID, COLLECTION_FOLDERS, folderId);

    // 4. Refresh folders list
    fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };


  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div className="sidebar-container">
        <h2>{username}'s Folders</h2>
        <form onSubmit={createFolder} className="add-folder-form">
          <input
            type="text"
            placeholder="New folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button type="submit">Create</button>
        </form>

        <div className="folders-list">
          {folders.map((f) => (
            <Link
              key={f.$id}
              to={`/folder/${f.$id}`}
              className="folder-item"
            >
              {f.name}
              <button className="delete-button" onClick={()=>deleteFolder(f.$id)}>delete</button>
            </Link>
            
          ))}
        </div>

        <button
          onClick={() => {
            logoutUser();
            navigate("/login");
          }}
          style={{ marginTop: "20px", color: "red" }}
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <main style={{ marginLeft: "250px", padding: "20px", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
