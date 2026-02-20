-- name: GetAllAccounts :many
SELECT id, name, type, balance FROM accounts ORDER BY id;

-- name: CreateAccount :one
INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?) RETURNING *;

-- name: UpdateAccount :exec
UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ?;

-- name: DeleteAccount :exec
DELETE FROM accounts WHERE id = ?;
