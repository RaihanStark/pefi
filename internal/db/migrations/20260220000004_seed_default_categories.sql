-- migrate:up
INSERT OR IGNORE INTO categories (type, name) VALUES
    ('expense', 'Food & Groceries'),
    ('expense', 'Food & Dining'),
    ('expense', 'Utilities'),
    ('expense', 'Housing'),
    ('expense', 'Transfer'),
    ('expense', 'Transport'),
    ('expense', 'Entertainment'),
    ('expense', 'Shopping'),
    ('expense', 'Health'),
    ('expense', 'Education'),
    ('expense', 'Other'),
    ('income', 'Salary'),
    ('income', 'Freelance'),
    ('income', 'Investment'),
    ('income', 'Transfer'),
    ('income', 'Gift'),
    ('income', 'Refund'),
    ('income', 'Other');

-- migrate:down
DELETE FROM categories;
