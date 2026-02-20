-- name: GetCategoriesByType :many
SELECT name FROM categories WHERE type = ? ORDER BY id;

-- name: AddCategory :exec
INSERT OR IGNORE INTO categories (type, name) VALUES (?, ?);

-- name: RenameCategory :exec
UPDATE categories SET name = ? WHERE type = ? AND name = ?;

-- name: RenameCategoryInTransactions :exec
UPDATE transactions SET category = ? WHERE category = ?;

-- name: DeleteCategory :exec
DELETE FROM categories WHERE type = ? AND name = ?;
