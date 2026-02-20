-- name: GetAllTransactions :many
SELECT id, account_id, date, name, amount, category, notes
FROM transactions ORDER BY date DESC, id DESC;

-- name: GetTransactionsByAccount :many
SELECT id, account_id, date, name, amount, category, notes
FROM transactions WHERE account_id = ? ORDER BY date DESC, id DESC;

-- name: CreateTransaction :one
INSERT INTO transactions (account_id, date, name, amount, category, notes)
VALUES (?, ?, ?, ?, ?, ?) RETURNING *;

-- name: DeleteTransaction :exec
DELETE FROM transactions WHERE id = ?;

-- name: GetTransactionAccountID :one
SELECT account_id FROM transactions WHERE id = ?;

-- name: RecalcAccountBalance :exec
UPDATE accounts SET balance = COALESCE(
    (SELECT SUM(amount) FROM transactions WHERE transactions.account_id = ?), 0
) WHERE accounts.id = ?;
