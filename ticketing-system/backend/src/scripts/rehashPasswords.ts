// src/scripts/rehashPasswords.ts
import { db } from '../db';
import bcrypt from 'bcryptjs';

async function rehashAllPasswords() {
  try {
    const users = await db.query('SELECT id, password FROM users');

    for (const user of users.rows) {
      const currentHash = user.password;
      
      // Optional: skip if already rehashed (you can store a flag in DB to track this)
      const needsRehash = currentHash.startsWith('$2a$') || currentHash.startsWith('$2b$'); // bcrypt format
      if (!needsRehash) {
        console.log(`⚠️ User ${user.id} already rehashed. Skipping.`);
        continue;
      }

      const match = await bcrypt.compare('test', currentHash); // Just to verify format
      if (typeof match === 'boolean') {
        // Rehash using bcryptjs
        const plainPasswordGuess = 'Admin@123'; // Replace this part (you need actual plain passwords!)
        const newHash = await bcrypt.hash(plainPasswordGuess, 10);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id]);
        console.log(`🔁 Rehashed user ${user.id}`);
      }
    }

    console.log('✅ All applicable passwords rehashed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during rehash:', err);
    process.exit(1);
  }
}

rehashAllPasswords();
