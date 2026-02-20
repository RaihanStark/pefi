-- name: GetAllBills :many
SELECT id, name, amount, due_day FROM bills ORDER BY due_day, id;

-- name: CreateBill :one
INSERT INTO bills (name, amount, due_day) VALUES (?, ?, ?) RETURNING *;

-- name: UpdateBill :exec
UPDATE bills SET name = ?, amount = ?, due_day = ? WHERE id = ?;

-- name: DeleteBill :exec
DELETE FROM bills WHERE id = ?;
