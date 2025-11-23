#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), "data");

async function createUsers() {
  const passwordHash = await bcrypt.hash("admin", 10);
  const password1234 = await bcrypt.hash("1234", 10);

  const users = {
    accounts: [
      {
        id: randomUUID(),
        username: "admin",
        displayName: "관리자",
        passwordHash: passwordHash,
        roles: ["admin"],
      },
      {
        id: randomUUID(),
        username: "lee",
        displayName: "이 리더",
        passwordHash: password1234,
        roles: ["leader"],
        cellId: "cell-lee",
      },
      {
        id: randomUUID(),
        username: "kim",
        displayName: "김 리더",
        passwordHash: password1234,
        roles: ["leader"],
        cellId: "cell-kim",
      },
      {
        id: randomUUID(),
        username: "jung",
        displayName: "정 리더",
        passwordHash: password1234,
        roles: ["leader"],
        cellId: "cell-jung",
      },
    ],
  };

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "users.json"),
    JSON.stringify(users, null, 2)
  );
  console.log("✅ Users created:");
  console.log("  - admin / admin (관리자)");
  console.log("  - lee / 1234 (이 리더)");
  console.log("  - kim / 1234 (김 리더)");
  console.log("  - jung / 1234 (정 리더)");
}

async function createCells() {
  const cells = {
    cells: [
      {
        id: "cell-lee",
        name: "이 셀",
        leaderId: "lee",
      },
      {
        id: "cell-kim",
        name: "김 셀",
        leaderId: "kim",
      },
      {
        id: "cell-jung",
        name: "정 셀",
        leaderId: "jung",
      },
    ],
  };

  await fs.writeFile(
    path.join(dataDir, "cells.json"),
    JSON.stringify(cells, null, 2)
  );
  console.log("✅ Cells created:");
  console.log("  - 이 셀");
  console.log("  - 김 셀");
  console.log("  - 정 셀");
}

async function createMembers() {
  const members = {
    members: [],
  };

  await fs.writeFile(
    path.join(dataDir, "members.json"),
    JSON.stringify(members, null, 2)
  );
  console.log("✅ Members file created (empty)");
}

async function createSessions() {
  const sessions = {
    sessions: [],
  };

  await fs.writeFile(
    path.join(dataDir, "sessions.json"),
    JSON.stringify(sessions, null, 2)
  );
  console.log("✅ Sessions file created (empty)");
}

async function createAttendance() {
  const attendance = {
    records: [],
  };

  await fs.writeFile(
    path.join(dataDir, "attendance.json"),
    JSON.stringify(attendance, null, 2)
  );
  console.log("✅ Attendance file created (empty)");
}

async function main() {
  console.log("🚀 Creating initial data...\n");
  await createUsers();
  await createCells();
  await createMembers();
  await createSessions();
  await createAttendance();
  console.log("\n✨ All data created successfully!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
