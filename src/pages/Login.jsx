// pages/Login.jsx
import React, { useState } from "react";
import { db, DB_ID, COLLECTION_USERS, QueryHelper, IDHelper } from "../utils/appwrite";
import { loginUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    if (!username) return;

    const existing = await db.listDocuments(DB_ID, COLLECTION_USERS, [
      QueryHelper.equal("username", username)
    ]);

    if (existing.total === 0) {
      await db.createDocument(DB_ID, COLLECTION_USERS, IDHelper.unique(), { username });
    }

    loginUser(username);
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        className="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin} className="login-button">
        Continue
      </button>
    </div>
  );
}
