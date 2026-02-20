-- migrate:up
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('expense','income')),
    name TEXT NOT NULL,
    UNIQUE(type, name)
);

-- migrate:down
DROP TABLE categories;
