import dotenv from "dotenv"
import path from "path"
const currentDir = path.dirname(new URL(import.meta.url).pathname)
const envPath = path.resolve(currentDir, "../../.env")
dotenv.config({ path: envPath })
