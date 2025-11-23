import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

export interface AccountRecord {
  id: string;
  username: string;
  displayName?: string;
  passwordHash: string;
  roles?: string[];
}

interface UsersFile {
  accounts: AccountRecord[];
}

const DEFAULT_USERS: UsersFile = { accounts: [] };

async function readUsersFile(): Promise<UsersFile> {
  try {
    const raw = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(raw) as UsersFile;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(usersFile, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
      return DEFAULT_USERS;
    }
    throw error;
  }
}

export async function getAccountByUsername(username: string): Promise<AccountRecord | undefined> {
  const file = await readUsersFile();
  const normalized = username.trim().toLowerCase();
  return file.accounts.find((account) => account.username.toLowerCase() === normalized);
}

export async function verifyCredentials(username: string, password: string): Promise<AccountRecord | null> {
  const account = await getAccountByUsername(username);
  if (!account) {
    return null;
  }
  const isValid = await bcrypt.compare(password, account.passwordHash);
  return isValid ? account : null;
}
