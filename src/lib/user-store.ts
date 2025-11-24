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
  passwordPlain?: string; // 관리자가 비밀번호 확인용
  roles?: string[];
  cellId?: string;
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

async function writeUsersFile(data: UsersFile): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAllAccounts(): Promise<Omit<AccountRecord, "passwordHash">[]> {
  const file = await readUsersFile();
  return file.accounts.map(({ passwordHash: _, ...rest }) => rest);
}

export async function getAllAccountsWithPassword(): Promise<AccountRecord[]> {
  const file = await readUsersFile();
  return file.accounts;
}

export async function createAccount(
  username: string,
  password: string,
  displayName?: string,
  roles?: string[],
  cellId?: string
): Promise<AccountRecord> {
  const file = await readUsersFile();

  const existing = file.accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
  if (existing) {
    throw new Error("이미 존재하는 아이디입니다.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newAccount: AccountRecord = {
    id: crypto.randomUUID(),
    username,
    displayName,
    passwordHash,
    passwordPlain: password,
    roles: roles || ["leader"],
    cellId,
  };

  file.accounts.push(newAccount);
  await writeUsersFile(file);
  return newAccount;
}

export async function updateAccount(
  id: string,
  updates: { displayName?: string; password?: string; roles?: string[]; cellId?: string }
): Promise<AccountRecord | null> {
  const file = await readUsersFile();
  const index = file.accounts.findIndex((a) => a.id === id);
  if (index === -1) return null;

  if (updates.displayName !== undefined) {
    file.accounts[index].displayName = updates.displayName;
  }
  if (updates.password) {
    file.accounts[index].passwordHash = await bcrypt.hash(updates.password, 10);
    file.accounts[index].passwordPlain = updates.password;
  }
  if (updates.roles !== undefined) {
    file.accounts[index].roles = updates.roles;
  }
  if (updates.cellId !== undefined) {
    file.accounts[index].cellId = updates.cellId;
  }

  await writeUsersFile(file);
  return file.accounts[index];
}

export async function deleteAccount(id: string): Promise<boolean> {
  const file = await readUsersFile();
  const index = file.accounts.findIndex((a) => a.id === id);
  if (index === -1) return false;

  file.accounts.splice(index, 1);
  await writeUsersFile(file);
  return true;
}
