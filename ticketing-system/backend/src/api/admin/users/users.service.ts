
import { db } from "../../../db";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  created_at: Date;
}

export const createUser = async (user: Omit<User, "id" | "created_at">): Promise<User> => {
  const hashedPassword = await bcrypt.hash(user.password!, 10);

  const existing = await db.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [user.email]
  );

  if (existing.rows.length > 0) {
    throw new Error("User with this email already exists");
  }

  const result = await db.query<User>(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [user.name, user.email, hashedPassword, user.role]
  );

  return result.rows[0];
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await db.query<User>(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await db.query<User>(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );

  return result.rows;
};

export const updateUser = async (
  id: number,
  updates: Partial<Omit<User, "id" | "created_at">>
): Promise<User | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (updates.name) {
    fields.push(`name = $${idx++}`);
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push(`email = $${idx++}`);
    values.push(updates.email);
  }
  if (updates.password) {
    const hashedPassword = await bcrypt.hash(updates.password, 10);
    fields.push(`password = $${idx++}`);
    values.push(hashedPassword);
  }
  if (updates.role) {
    fields.push(`role = $${idx++}`);
    values.push(updates.role);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);

  const result = await db.query<User>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, name, email, role, created_at`,
    values
  );

  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<User | null> => {
  const result = await db.query<User>(
    "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, created_at",
    [id]
  );

  return result.rows[0] || null;
};
