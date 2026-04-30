const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to DB");

  try {
    // Clear existing data (Careful: this wipes the DB)
    console.log("Clearing existing data...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE tasks");
    await connection.execute("TRUNCATE TABLE projectMembers");
    await connection.execute("TRUNCATE TABLE projects");
    await connection.execute("TRUNCATE TABLE otps");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    const adminPassword = await bcrypt.hash("EtheraAdmin@2026", 12);
    const userPassword = await bcrypt.hash("EtheraUser@2026", 12);

    // 1. Create Admin
    console.log("Creating Admin...");
    const [adminResult] = await connection.execute(
      "INSERT INTO users (name, email, password, role, isVerified) VALUES (?, ?, ?, ?, ?)",
      ["Admin Ethera", "admin@ethera.com", adminPassword, "ADMIN", true]
    );
    const adminId = adminResult.insertId;

    // 2. Create Members
    console.log("Creating Members...");
    const members = [
      ["Arjun Sharma", "arjun.sharma@ethera.com"],
      ["Priya Patel", "priya.patel@ethera.com"],
      ["Rohan Gupta", "rohan.gupta@ethera.com"],
      ["Ananya Singh", "ananya.singh@ethera.com"],
      ["Vikram Malhotra", "vikram.malhotra@ethera.com"],
      ["Ishani Verma", "ishani.verma@ethera.com"],
      ["Siddharth Das", "siddharth.das@ethera.com"],
      ["Kavya Reddy", "kavya.reddy@ethera.com"],
      ["Aditya Nair", "aditya.nair@ethera.com"],
      ["Meera Iyer", "meera.iyer@ethera.com"],
    ];

    const memberIds = [];
    for (const [name, email] of members) {
      const [res] = await connection.execute(
        "INSERT INTO users (name, email, password, role, isVerified) VALUES (?, ?, ?, ?, ?)",
        [name, email, userPassword, "MEMBER", true]
      );
      memberIds.push(res.insertId);
    }

    // 3. Create Project
    console.log("Creating Project...");
    const [projectResult] = await connection.execute(
      "INSERT INTO projects (name, description, createdBy) VALUES (?, ?, ?)",
      ["Ethera AI Core Development", "The main project for building the Ethera AI task management system.", adminId]
    );
    const projectId = projectResult.insertId;

    // 4. Add members to project
    console.log("Adding members to project...");
    for (const mId of memberIds) {
      await connection.execute(
        "INSERT INTO projectMembers (projectId, userId) VALUES (?, ?)",
        [projectId, mId]
      );
    }

    // 5. Create Tasks and assign
    console.log("Creating Tasks...");
    const taskTitles = [
      ["Database Schema Design", "DONE"],
      ["API Authentication Implementation", "DONE"],
      ["Frontend UI/UX Mockups", "IN_PROGRESS"],
      ["Google OAuth Integration", "IN_PROGRESS"],
      ["Email Notification System", "TODO"],
      ["Task Assignment Logic", "TODO"],
      ["Admin Analytics Dashboard", "TODO"],
      ["Mobile App Skeleton", "TODO"],
      ["Documentation and API Docs", "TODO"],
      ["Final Security Audit", "TODO"],
    ];

    for (let i = 0; i < 10; i++) {
      await connection.execute(
        "INSERT INTO tasks (title, description, status, assignedTo, projectId) VALUES (?, ?, ?, ?, ?)",
        [
          taskTitles[i][0],
          `High priority task for ${taskTitles[i][0]}`,
          taskTitles[i][1],
          memberIds[i],
          projectId
        ]
      );
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await connection.end();
  }
}

seed();
