-- migrate:up
CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    due_day INTEGER NOT NULL CHECK(due_day >= 1 AND due_day <= 31)
);

-- migrate:down
DROP TABLE bills;
