#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const dataDir = path.join("/Users/john/projects/services/rollbook", "data");
const usersFile = path.join(dataDir, "users.json");

async function main() {
  // Create data directory
  await fs.mkdir(dataDir, { recursive: true });

  // Hash the password
  const passwordHash = await bcrypt.hash("admin", 10);

  // Create user object
  const users = {
    accounts: [{
      id: randomUUID(),
      username: "admin",
      displayName: "admin",
      passwordHash: passwordHash,
      roles: ["admin"]
    }]
  };

  // Write to file
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
  console.log("Admin user 'admin' created successfully!");
  console.log(`Password hash: ${passwordHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
