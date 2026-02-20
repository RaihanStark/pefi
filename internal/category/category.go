package category

import (
	"context"
	"database/sql"

	"pefi/internal/db/sqlc"
)

func GetByType(db *sql.DB, typ string) ([]string, error) {
	return sqlc.New(db).GetCategoriesByType(context.Background(), typ)
}

func Add(db *sql.DB, typ, name string) error {
	return sqlc.New(db).AddCategory(context.Background(), sqlc.AddCategoryParams{
		Type: typ,
		Name: name,
	})
}

func Rename(conn *sql.DB, typ, oldName, newName string) error {
	ctx := context.Background()

	tx, err := conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	q := sqlc.New(tx)

	if err := q.RenameCategory(ctx, sqlc.RenameCategoryParams{
		Name:   newName,
		Type:   typ,
		Name_2: oldName,
	}); err != nil {
		return err
	}

	if err := q.RenameCategoryInTransactions(ctx, sqlc.RenameCategoryInTransactionsParams{
		Category:   newName,
		Category_2: oldName,
	}); err != nil {
		return err
	}

	return tx.Commit()
}

func Delete(db *sql.DB, typ, name string) error {
	return sqlc.New(db).DeleteCategory(context.Background(), sqlc.DeleteCategoryParams{
		Type: typ,
		Name: name,
	})
}
