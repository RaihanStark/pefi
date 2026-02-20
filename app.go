package main

import (
	"context"
	"database/sql"
	"log"

	"pefi/internal/account"
	"pefi/internal/category"
	db "pefi/internal/db"
	"pefi/internal/transaction"
)

type App struct {
	ctx  context.Context
	conn *sql.DB
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	path, err := db.Path()
	if err != nil {
		log.Fatalf("db path: %v", err)
	}

	conn, err := db.Init(path)
	if err != nil {
		log.Fatalf("init db: %v", err)
	}
	a.conn = conn
}

func (a *App) shutdown(ctx context.Context) {
	if a.conn != nil {
		a.conn.Close()
	}
}

// Accounts

func (a *App) GetAccounts() ([]account.AccountData, error) {
	return account.GetAll(a.conn)
}

func (a *App) CreateAccount(name, typ string, balance int64) (account.AccountData, error) {
	return account.Create(a.conn, name, typ, balance)
}

func (a *App) UpdateAccount(id int64, name, typ string, balance int64) error {
	return account.Update(a.conn, id, name, typ, balance)
}

func (a *App) DeleteAccount(id int64) error {
	return account.Delete(a.conn, id)
}

// Transactions

func (a *App) GetTransactions(accountId int64) ([]transaction.TransactionData, error) {
	return transaction.GetByAccount(a.conn, accountId)
}

func (a *App) CreateTransaction(accountId int64, date, name string, amount int64, cat, notes string) (transaction.TransactionData, error) {
	return transaction.Create(a.conn, accountId, date, name, amount, cat, notes)
}

func (a *App) DeleteTransaction(id int64) error {
	return transaction.Delete(a.conn, id)
}

// Categories

func (a *App) GetCategories(typ string) ([]string, error) {
	return category.GetByType(a.conn, typ)
}

func (a *App) AddCategory(typ, name string) error {
	return category.Add(a.conn, typ, name)
}

func (a *App) RenameCategory(typ, oldName, newName string) error {
	return category.Rename(a.conn, typ, oldName, newName)
}

func (a *App) DeleteCategory(typ, name string) error {
	return category.Delete(a.conn, typ, name)
}
