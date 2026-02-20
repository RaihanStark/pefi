package transaction

import (
	"context"
	"database/sql"

	"pefi/internal/db/sqlc"
)

type TransactionData struct {
	ID        int64  `json:"id"`
	AccountID int64  `json:"accountId"`
	Date      string `json:"date"`
	Name      string `json:"name"`
	Amount    int64  `json:"amount"`
	Category  string `json:"category"`
	Notes     string `json:"notes"`
}

func fromSqlc(t sqlc.Transaction) TransactionData {
	return TransactionData{
		ID: t.ID, AccountID: t.AccountID, Date: t.Date,
		Name: t.Name, Amount: t.Amount, Category: t.Category, Notes: t.Notes,
	}
}

func GetAll(db *sql.DB) ([]TransactionData, error) {
	rows, err := sqlc.New(db).GetAllTransactions(context.Background())
	if err != nil {
		return nil, err
	}
	result := make([]TransactionData, len(rows))
	for i, r := range rows {
		result[i] = fromSqlc(r)
	}
	return result, nil
}

func GetByAccount(db *sql.DB, accountId int64) ([]TransactionData, error) {
	rows, err := sqlc.New(db).GetTransactionsByAccount(context.Background(), accountId)
	if err != nil {
		return nil, err
	}
	result := make([]TransactionData, len(rows))
	for i, r := range rows {
		result[i] = fromSqlc(r)
	}
	return result, nil
}

func Create(db *sql.DB, accountId int64, date, name string, amount int64, category, notes string) (TransactionData, error) {
	ctx := context.Background()
	q := sqlc.New(db)

	tx, err := q.CreateTransaction(ctx, sqlc.CreateTransactionParams{
		AccountID: accountId,
		Date:      date,
		Name:      name,
		Amount:    amount,
		Category:  category,
		Notes:     notes,
	})
	if err != nil {
		return TransactionData{}, err
	}

	if err := q.RecalcAccountBalance(ctx, sqlc.RecalcAccountBalanceParams{
		AccountID: accountId,
		ID:        accountId,
	}); err != nil {
		return TransactionData{}, err
	}

	return fromSqlc(tx), nil
}

func Delete(db *sql.DB, id int64) error {
	ctx := context.Background()
	q := sqlc.New(db)

	accountId, err := q.GetTransactionAccountID(ctx, id)
	if err != nil {
		return err
	}

	if err := q.DeleteTransaction(ctx, id); err != nil {
		return err
	}

	return q.RecalcAccountBalance(ctx, sqlc.RecalcAccountBalanceParams{
		AccountID: accountId,
		ID:        accountId,
	})
}
