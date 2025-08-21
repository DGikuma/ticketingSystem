import { db } from "../../../db";
import bcrypt from "bcryptjs";

export interface UserData {
  id?: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  avatar?: string | null;
}

// ✅ Hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export const UsersService = {
  // Create new user
  async createUser(data: UserData) {
    // Enforce unique email/username
    const existing = await db.query(
      "SELECT * FROM users WHERE email=$1 OR username=$2",
      [data.email, data.username]
    );
    if (existing.rows.length > 0) {
      throw new Error("Email or username already exists");
    }

    const hashedPassword = data.password
      ? await hashPassword(data.password)
      : null;

    const result = await db.query(
      `INSERT INTO users (name, email, username, password, role, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, username, role, avatar`,
      [data.name, data.email, data.username, hashedPassword, data.role, data.avatar || null]
    );

    return result.rows[0];
  },

  // Get all users
  async getAllUsers() {
    const result = await db.query(
      "SELECT id, name, email, username, role, avatar FROM users ORDER BY id DESC"
    );
    return result.rows;
  },

  // Get one user
  async getUserById(id: number) {
    const result = await db.query(
      "SELECT id, name, email, username, role, avatar FROM users WHERE id=$1",
      [id]
    );
    return result.rows[0];
  },

  // Update user
  async updateUser(id: number, data: Partial<UserData>) {
    const user = await this.getUserById(id);
    if (!user) throw new Error("User not found");

    // Prevent duplicates
    if (data.email || data.username) {
      const existing = await db.query(
        "SELECT * FROM users WHERE (email=$1 OR username=$2) AND id<>$3",
        [data.email ?? user.email, data.username ?? user.username, id]
      );
      if (existing.rows.length > 0) {
        throw new Error("Email or username already taken");
      }
    }

    let hashedPassword = user.password;
    if (data.password) {
      hashedPassword = await hashPassword(data.password);
    }

    const result = await db.query(
      `UPDATE users
       SET name=$1, email=$2, username=$3, password=$4, role=$5, avatar=$6
       WHERE id=$7
       RETURNING id, name, email, username, role, avatar`,
      [
        data.name ?? user.name,
        data.email ?? user.email,
        data.username ?? user.username,
        hashedPassword,
        data.role ?? user.role,
        data.avatar ?? user.avatar,
        id,
      ]
    );

    return result.rows[0];
  },

  // Delete user
  async deleteUser(id: number) {
    const result = await db.query(
      "DELETE FROM users WHERE id=$1 RETURNING id, avatar",
      [id]
    );
    return result.rows[0];
  },
};
