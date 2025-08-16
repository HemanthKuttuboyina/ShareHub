// utils/appwrite.js
import { Client, Databases, ID, Query, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("PROJECT_ID");

export const db = new Databases(client);
export const storage = new Storage(client);
export const IDHelper = ID;
export const QueryHelper = Query;

export const DB_ID = 
export const COLLECTION_USERS = ""
export const COLLECTION_FOLDERS ="" 
export const COLLECTION_FILES =""
export const BUCKET_ID = ""
