package bill

import (
	"context"
	"database/sql"

	"pefi/internal/db/sqlc"
)

type BillData struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Amount int64  `json:"amount"`
	DueDay int64  `json:"dueDay"`
}

func fromSqlc(b sqlc.Bill) BillData {
	return BillData{ID: b.ID, Name: b.Name, Amount: b.Amount, DueDay: b.DueDay}
}

func GetAll(db *sql.DB) ([]BillData, error) {
	rows, err := sqlc.New(db).GetAllBills(context.Background())
	if err != nil {
		return nil, err
	}
	result := make([]BillData, len(rows))
	for i, r := range rows {
		result[i] = fromSqlc(r)
	}
	return result, nil
}

func Create(db *sql.DB, name string, amount int64, dueDay int64) (BillData, error) {
	b, err := sqlc.New(db).CreateBill(context.Background(), sqlc.CreateBillParams{
		Name:   name,
		Amount: amount,
		DueDay: dueDay,
	})
	if err != nil {
		return BillData{}, err
	}
	return fromSqlc(b), nil
}

func Update(db *sql.DB, id int64, name string, amount int64, dueDay int64) error {
	return sqlc.New(db).UpdateBill(context.Background(), sqlc.UpdateBillParams{
		ID:     id,
		Name:   name,
		Amount: amount,
		DueDay: dueDay,
	})
}

func Delete(db *sql.DB, id int64) error {
	return sqlc.New(db).DeleteBill(context.Background(), id)
}
