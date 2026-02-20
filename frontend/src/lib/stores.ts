import { writable } from 'svelte/store';
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
    GetDebts,
    CreateDebt as GoCreateDebt,
    UpdateDebt as GoUpdateDebt,
    DeleteDebt as GoDeleteDebt,
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

export const bankAccounts = accounts;

// Load functions
export async function loadAccounts() {
    const data = await GetAccounts();
    accounts.set(data as Account[]);
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
    const acc = await GoCreateAccount(name, type, balance);
    accounts.update(list => [...list, acc as Account]);
}

export async function updateAccount(id: number, data: Partial<Omit<Account, 'id'>>) {
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

// Debts

export interface Installment {
    dueDate: string;
    amount: number;
    status: 'paid' | 'upcoming' | 'overdue';
    paidDate?: string;
}

export interface Debt {
    id: number;
    name: string;
    amount: number;
    notes: string;
    installments: Installment[];
}

export function debtPaid(d: Debt): number {
    return d.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
}

export function debtRemaining(d: Debt): number {
    return d.amount - debtPaid(d);
}

export const debts = writable<Debt[]>([]);

export async function loadDebts() {
    const data = await GetDebts();
    debts.set((data ?? []) as Debt[]);
}

export async function addDebt(name: string): Promise<number> {
    const d = await GoCreateDebt(name);
    const created = d as unknown as Debt;
    debts.update(list => [...list, { ...created, installments: created.installments ?? [] }]);
    return created.id;
}

export async function updateDebt(id: number, data: Partial<Omit<Debt, 'id'>>) {
    let current: Debt | undefined;
    debts.subscribe(list => { current = list.find(d => d.id === id); })();
    if (!current) return;
    const merged = { ...current, ...data };
    await GoUpdateDebt(id, merged.name, merged.amount, merged.notes, merged.installments as any);
    debts.update(list => list.map(d => d.id === id ? merged : d));
}

export async function deleteDebt(id: number) {
    await GoDeleteDebt(id);
    debts.update(list => list.filter(d => d.id !== id));
}

export function formatRupiah(amount: number): string {
    const abs = Math.abs(amount);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + 'Rp ' + formatted;
}
