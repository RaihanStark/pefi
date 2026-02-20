-- name: GetAllDebts :many
SELECT id, name, amount, notes FROM debts ORDER BY id;

-- name: CreateDebt :one
INSERT INTO debts (name) VALUES (?) RETURNING *;

-- name: UpdateDebt :exec
UPDATE debts SET name = ?, amount = ?, notes = ? WHERE id = ?;

-- name: DeleteDebt :exec
DELETE FROM debts WHERE id = ?;

-- name: GetInstallmentsByDebt :many
SELECT id, debt_id, due_date, amount, status, paid_date
FROM installments WHERE debt_id = ? ORDER BY due_date, id;

-- name: DeleteInstallmentsByDebt :exec
DELETE FROM installments WHERE debt_id = ?;

-- name: CreateInstallment :exec
INSERT INTO installments (debt_id, due_date, amount, status, paid_date)
VALUES (?, ?, ?, ?, ?);
