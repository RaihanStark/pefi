package account

import (
	"context"
	"database/sql"

	"pefi/internal/db/sqlc"
)

type AccountData struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Balance int64  `json:"balance"`
}

func fromSqlc(a sqlc.Account) AccountData {
	return AccountData{ID: a.ID, Name: a.Name, Type: a.Type, Balance: a.Balance}
}

func GetAll(db *sql.DB) ([]AccountData, error) {
	rows, err := sqlc.New(db).GetAllAccounts(context.Background())
	if err != nil {
		return nil, err
	}
	result := make([]AccountData, len(rows))
	for i, r := range rows {
		result[i] = fromSqlc(r)
	}
	return result, nil
}

func Create(db *sql.DB, name, typ string, balance int64) (AccountData, error) {
	acc, err := sqlc.New(db).CreateAccount(context.Background(), sqlc.CreateAccountParams{
		Name:    name,
		Type:    typ,
		Balance: balance,
	})
	if err != nil {
		return AccountData{}, err
	}
	return fromSqlc(acc), nil
}

func Update(db *sql.DB, id int64, name, typ string, balance int64) error {
	return sqlc.New(db).UpdateAccount(context.Background(), sqlc.UpdateAccountParams{
		ID:      id,
		Name:    name,
		Type:    typ,
		Balance: balance,
	})
}

func Delete(db *sql.DB, id int64) error {
	return sqlc.New(db).DeleteAccount(context.Background(), id)
}
