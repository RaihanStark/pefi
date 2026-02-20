-- migrate:up
CREATE TABLE installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('paid','upcoming','overdue')),
    paid_date TEXT NOT NULL DEFAULT ''
);

-- migrate:down
DROP TABLE installments;
