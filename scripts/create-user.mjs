#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    const nodeError = error;
    if (nodeError?.code === "ENOENT") {
      return { accounts: [] };
    }
    throw error;
  }
}

async function writeUsers(payload) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(payload, null, 2));
}

async function promptForPassword(rl, label) {
  const password = await rl.question(label, { hideEchoBack: true });
  output.write("\n");
  return password.trim();
}

async function main() {
  const usernameArg = process.argv[2];
  const displayNameArg = process.argv[3];
  if (!usernameArg) {
    console.error("Usage: npm run user:add <username> [displayName]");
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  const password = await promptForPassword(rl, "Password: ");
  const confirm = await promptForPassword(rl, "Confirm Password: ");
  rl.close();

  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }
  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const users = await readUsers();
  if (!Array.isArray(users.accounts)) {
    users.accounts = [];
  }

  const existing = users.accounts.find(
    (account) => account.username.toLowerCase() === usernameArg.toLowerCase(),
  );
  if (existing) {
    console.error(`Username \"${usernameArg}\" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.accounts.push({
    id: randomUUID(),
    username: usernameArg,
    displayName: displayNameArg || usernameArg,
    passwordHash,
    roles: ["admin"],
  });

  await writeUsers(users);
  console.log(`User \"${usernameArg}\" added successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
