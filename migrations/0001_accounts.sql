PRAGMA foreign_keys = ON;
CREATE TABLE users (
 id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','student')),
 status TEXT NOT NULL CHECK(status IN ('invited','active','suspended')),
 issuer TEXT, subject TEXT, invited_at TEXT NOT NULL,
 invite_expires TEXT, joined_at TEXT, last_seen TEXT,
 UNIQUE(issuer,subject)
);
CREATE TRIGGER user_capacity BEFORE INSERT ON users
 WHEN (SELECT COUNT(*) FROM users)>=10
 BEGIN SELECT RAISE(ABORT,'ACCOUNT_LIMIT'); END;
CREATE TABLE sessions (
 id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 started_at TEXT NOT NULL, last_at TEXT NOT NULL, PRIMARY KEY(user_id,id)
);
CREATE TABLE events (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 id TEXT NOT NULL, session_id TEXT NOT NULL,
 kind TEXT NOT NULL, lesson_id TEXT, exercise_id TEXT, attempt_id TEXT,
 occurred_at TEXT NOT NULL, received_at TEXT NOT NULL,
 content_version TEXT NOT NULL, payload TEXT NOT NULL,
 applied INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(user_id,id),
 FOREIGN KEY(user_id,session_id) REFERENCES sessions(user_id,id) ON DELETE CASCADE
);
CREATE INDEX events_by_user_time ON events(user_id,occurred_at DESC);
CREATE INDEX sessions_by_user_time ON sessions(user_id,last_at DESC);
CREATE TABLE progress (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 scope TEXT NOT NULL, item_id TEXT NOT NULL, state TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, event_id TEXT,
 PRIMARY KEY(user_id,scope,item_id)
);
CREATE TABLE attempts (
 user_id TEXT NOT NULL, id TEXT NOT NULL, exercise_id TEXT NOT NULL,
 session_id TEXT NOT NULL, started_at TEXT NOT NULL,
 PRIMARY KEY(user_id,id),
 FOREIGN KEY(user_id,session_id) REFERENCES sessions(user_id,id) ON DELETE CASCADE
);
CREATE TABLE active_intervals (
 user_id TEXT NOT NULL, event_id TEXT NOT NULL, session_id TEXT NOT NULL,
 start_ms INTEGER NOT NULL, end_ms INTEGER NOT NULL,
 PRIMARY KEY(user_id,event_id),
 FOREIGN KEY(user_id,event_id) REFERENCES events(user_id,id) ON DELETE CASCADE
);
CREATE INDEX intervals_by_user_time ON active_intervals(user_id,start_ms);
CREATE TABLE admin_audit (
 id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL,
 target_id TEXT, at TEXT NOT NULL
);
CREATE TABLE rate_limits (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 bucket INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(user_id,bucket)
);
CREATE TABLE imports (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 at TEXT NOT NULL, token TEXT NOT NULL
);
INSERT INTO users(id,email,name,role,status,invited_at)
VALUES('administrator','andresdiegolanda@gmail.com','Andrés','admin','invited',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
