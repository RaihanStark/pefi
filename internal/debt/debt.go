package debt

import (
	"context"
	"database/sql"

	"pefi/internal/db/sqlc"
)

type InstallmentData struct {
	DueDate  string `json:"dueDate"`
	Amount   int64  `json:"amount"`
	Status   string `json:"status"`
	PaidDate string `json:"paidDate"`
}

type DebtData struct {
	ID           int64             `json:"id"`
	Name         string            `json:"name"`
	Amount       int64             `json:"amount"`
	Notes        string            `json:"notes"`
	Installments []InstallmentData `json:"installments"`
}

func installmentFromSqlc(i sqlc.Installment) InstallmentData {
	return InstallmentData{
		DueDate:  i.DueDate,
		Amount:   i.Amount,
		Status:   i.Status,
		PaidDate: i.PaidDate,
	}
}

func GetAll(db *sql.DB) ([]DebtData, error) {
	ctx := context.Background()
	q := sqlc.New(db)

	rows, err := q.GetAllDebts(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]DebtData, len(rows))
	for i, r := range rows {
		insts, err := q.GetInstallmentsByDebt(ctx, r.ID)
		if err != nil {
			return nil, err
		}
		instData := make([]InstallmentData, len(insts))
		for j, inst := range insts {
			instData[j] = installmentFromSqlc(inst)
		}
		result[i] = DebtData{
			ID:           r.ID,
			Name:         r.Name,
			Amount:       r.Amount,
			Notes:        r.Notes,
			Installments: instData,
		}
	}
	return result, nil
}

func Create(db *sql.DB, name string) (DebtData, error) {
	d, err := sqlc.New(db).CreateDebt(context.Background(), name)
	if err != nil {
		return DebtData{}, err
	}
	return DebtData{
		ID:           d.ID,
		Name:         d.Name,
		Amount:       d.Amount,
		Notes:        d.Notes,
		Installments: []InstallmentData{},
	}, nil
}

func Update(conn *sql.DB, id int64, name string, amount int64, notes string, installments []InstallmentData) error {
	ctx := context.Background()

	tx, err := conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	q := sqlc.New(tx)

	if err := q.UpdateDebt(ctx, sqlc.UpdateDebtParams{
		ID:     id,
		Name:   name,
		Amount: amount,
		Notes:  notes,
	}); err != nil {
		return err
	}

	if err := q.DeleteInstallmentsByDebt(ctx, id); err != nil {
		return err
	}

	for _, inst := range installments {
		if err := q.CreateInstallment(ctx, sqlc.CreateInstallmentParams{
			DebtID:   id,
			DueDate:  inst.DueDate,
			Amount:   inst.Amount,
			Status:   inst.Status,
			PaidDate: inst.PaidDate,
		}); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func Delete(db *sql.DB, id int64) error {
	return sqlc.New(db).DeleteDebt(context.Background(), id)
}
