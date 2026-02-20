-- migrate:up
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bank','debt')),
    balance INTEGER NOT NULL DEFAULT 0
);

-- migrate:down
DROP TABLE accounts;
