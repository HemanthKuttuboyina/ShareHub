// utils/appwrite.js
import { Client, Databases, ID, Query, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("688cadcb00377a2b178e");

export const db = new Databases(client);
export const storage = new Storage(client);
export const IDHelper = ID;
export const QueryHelper = Query;

export const DB_ID = "688cafe30027b05f4070";
export const COLLECTION_USERS = "68966ec3002b13461114";
export const COLLECTION_FOLDERS = "68966ef600032b0c610b";
export const COLLECTION_FILES ="68966f3300232b375b91";
export const BUCKET_ID = "688fad0a00391fa39f85";
