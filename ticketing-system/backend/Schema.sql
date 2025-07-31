-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user',  -- You can use a CHECK constraint or ENUM if desired
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file VARCHAR(255),
  status VARCHAR(10) DEFAULT 'open',  -- Consider using CHECK(status IN (...))
  priority VARCHAR(10) DEFAULT 'Medium',
  needs_escalation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Automatically update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_ticket
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  attachment VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP
);

-- Optional: Password resets
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional indexes
CREATE INDEX idx_ticket_user ON tickets(user_id);
CREATE INDEX idx_ticket_assigned ON tickets(assigned_to);
CREATE INDEX idx_comment_ticket ON comments(ticket_id);
CREATE INDEX idx_comment_parent ON comments(parent_id);
