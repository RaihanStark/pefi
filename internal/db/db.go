package db

import (
	"database/sql"
	"embed"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"

	"github.com/amacneil/dbmate/v2/pkg/dbmate"
	_ "github.com/amacneil/dbmate/v2/pkg/driver/sqlite"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func Path() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("get config dir: %w", err)
	}
	dir := filepath.Join(configDir, "pefi")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("create config dir: %w", err)
	}
	return filepath.Join(dir, "pefi.db"), nil
}

func Init(dbPath string) (*sql.DB, error) {
	if err := runMigrations(dbPath); err != nil {
		return nil, fmt.Errorf("migrations: %w", err)
	}

	conn, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	return conn, nil
}

func runMigrations(dbPath string) error {
	u, err := url.Parse("sqlite3:" + dbPath)
	if err != nil {
		return err
	}

	dm := dbmate.New(u)
	dm.FS = migrationsFS
	dm.MigrationsDir = []string{"migrations"}
	dm.AutoDumpSchema = false
	dm.Log = io.Discard

	return dm.CreateAndMigrate()
}
