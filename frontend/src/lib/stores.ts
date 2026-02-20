import { writable, derived } from 'svelte/store';
import {
    GetAccounts,
    CreateAccount as GoCreateAccount,
    UpdateAccount as GoUpdateAccount,
    DeleteAccount as GoDeleteAccount,
    GetTransactions,
    CreateTransaction as GoCreateTransaction,
    DeleteTransaction as GoDeleteTransaction,
    GetCategories,
    AddCategory as GoAddCategory,
    RenameCategory as GoRenameCategory,
    DeleteCategory as GoDeleteCategory,
} from '../../wailsjs/go/main/App';

export interface Account {
    id: number;
    name: string;
    type: 'bank' | 'debt';
    balance: number;
}

export interface Transaction {
    id: number;
    accountId: number;
    date: string;
    name: string;
    amount: number;
    category: string;
    notes: string;
}

// Stores
export const accounts = writable<Account[]>([]);
export const transactions = writable<Transaction[]>([]);
export const expenseCategories = writable<string[]>([]);
export const incomeCategories = writable<string[]>([]);

export const bankAccounts = derived(accounts, $a => $a.filter(a => a.type === 'bank'));
export const debtAccounts = derived(accounts, $a => $a.filter(a => a.type === 'debt'));

// Debt ID counter for in-memory debt accounts
let nextDebtId = -1;

// Load functions
export async function loadAccounts() {
    const data = await GetAccounts();
    accounts.update(current => {
        const debts = current.filter(a => a.type === 'debt');
        return [...data as Account[], ...debts];
    });
}

export async function loadTransactions(accountId: number) {
    const data = await GetTransactions(accountId);
    transactions.update(current => {
        const other = current.filter(t => t.accountId !== accountId);
        return [...other, ...(data as Transaction[])];
    });
}

export async function loadCategories() {
    const [expense, income] = await Promise.all([
        GetCategories('expense'),
        GetCategories('income'),
    ]);
    expenseCategories.set(expense);
    incomeCategories.set(income);
}

// Account CRUD
export async function addAccount(name: string, type: 'bank' | 'debt', balance: number) {
    if (type === 'debt') {
        accounts.update(list => [...list, { id: nextDebtId--, name, type, balance }]);
        return;
    }
    const acc = await GoCreateAccount(name, type, balance);
    accounts.update(list => [...list, acc as Account]);
}

export async function updateAccount(id: number, data: Partial<Omit<Account, 'id'>>) {
    if (id < 0) {
        // In-memory debt account
        accounts.update(list => list.map(a => a.id === id ? { ...a, ...data } : a));
        return;
    }
    // Need full values for the Go call
    let current: Account | undefined;
    accounts.subscribe(list => { current = list.find(a => a.id === id); })();
    if (!current) return;
    const name = data.name ?? current.name;
    const type = data.type ?? current.type;
    const balance = data.balance ?? current.balance;
    await GoUpdateAccount(id, name, type, balance);
    accounts.update(list => list.map(a => a.id === id ? { ...a, ...data } : a));
}

export async function deleteAccount(id: number) {
    if (id < 0) {
        accounts.update(list => list.filter(a => a.id !== id));
        return;
    }
    await GoDeleteAccount(id);
    accounts.update(list => list.filter(a => a.id !== id));
    transactions.update(list => list.filter(t => t.accountId !== id));
}

// Transaction CRUD
export async function addTransaction(tx: Omit<Transaction, 'id'>) {
    const created = await GoCreateTransaction(tx.accountId, tx.date, tx.name, tx.amount, tx.category, tx.notes);
    transactions.update(list => [...list, created as Transaction]);
    // Refresh accounts to get updated balance
    await loadAccounts();
}

export async function deleteTransaction(id: number) {
    await GoDeleteTransaction(id);
    transactions.update(list => list.filter(t => t.id !== id));
    await loadAccounts();
}

// Category CRUD
export async function addCategory(type: 'expense' | 'income', name: string) {
    await GoAddCategory(type, name);
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.includes(name) ? list : [...list, name]);
}

export async function renameCategory(type: 'expense' | 'income', oldName: string, newName: string) {
    await GoRenameCategory(type, oldName, newName);
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.map(c => c === oldName ? newName : c));
    transactions.update(list => list.map(t => t.category === oldName ? { ...t, category: newName } : t));
}

export async function deleteCategory(type: 'expense' | 'income', name: string) {
    await GoDeleteCategory(type, name);
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.filter(c => c !== name));
}

export function formatRupiah(amount: number): string {
    const abs = Math.abs(amount);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + 'Rp ' + formatted;
}
