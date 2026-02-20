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

// Debts (mock, in-memory)
let nextDebtId = 100;

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

export const debts = writable<Debt[]>([
    {
        id: 1, name: 'Andi', amount: 5000000,
        notes: 'Personal loan, no interest',
        installments: [
            { dueDate: '2025-11-01', amount: 1000000, status: 'paid', paidDate: '2025-11-05' },
            { dueDate: '2025-12-01', amount: 1000000, status: 'paid', paidDate: '2025-12-02' },
            { dueDate: '2026-01-01', amount: 1000000, status: 'paid', paidDate: '2026-01-03' },
            { dueDate: '2026-02-01', amount: 1000000, status: 'upcoming' },
            { dueDate: '2026-03-01', amount: 1000000, status: 'upcoming' },
        ],
    },
    {
        id: 2, name: 'Budi', amount: 8000000,
        notes: 'Business loan',
        installments: [
            { dueDate: '2026-01-15', amount: 2000000, status: 'paid', paidDate: '2026-01-15' },
            { dueDate: '2026-02-15', amount: 2000000, status: 'overdue' },
            { dueDate: '2026-03-15', amount: 2000000, status: 'upcoming' },
            { dueDate: '2026-04-15', amount: 2000000, status: 'upcoming' },
        ],
    },
    {
        id: 3, name: 'Citra', amount: 7500000,
        notes: 'Emergency fund',
        installments: [
            { dueDate: '2026-02-01', amount: 2500000, status: 'upcoming' },
            { dueDate: '2026-03-01', amount: 2500000, status: 'upcoming' },
            { dueDate: '2026-04-01', amount: 2500000, status: 'upcoming' },
        ],
    },
    {
        id: 4, name: 'Dewi', amount: 6000000,
        notes: 'Almost done',
        installments: [
            { dueDate: '2025-10-01', amount: 1500000, status: 'paid', paidDate: '2025-10-01' },
            { dueDate: '2025-11-01', amount: 1500000, status: 'paid', paidDate: '2025-11-03' },
            { dueDate: '2025-12-01', amount: 1500000, status: 'paid', paidDate: '2025-12-01' },
            { dueDate: '2026-01-01', amount: 1500000, status: 'overdue' },
        ],
    },
    {
        id: 5, name: 'Eka', amount: 4500000,
        notes: '',
        installments: [
            { dueDate: '2026-01-01', amount: 1500000, status: 'paid', paidDate: '2026-01-05' },
            { dueDate: '2026-02-01', amount: 1500000, status: 'upcoming' },
            { dueDate: '2026-03-01', amount: 1500000, status: 'upcoming' },
        ],
    },
    {
        id: 6, name: 'Fajar', amount: 4000000,
        notes: '',
        installments: [
            { dueDate: '2026-03-10', amount: 1000000, status: 'upcoming' },
            { dueDate: '2026-04-10', amount: 1000000, status: 'upcoming' },
            { dueDate: '2026-05-10', amount: 1000000, status: 'upcoming' },
            { dueDate: '2026-06-10', amount: 1000000, status: 'upcoming' },
        ],
    },
]);

export function addDebt(name: string): number {
    const id = nextDebtId++;
    debts.update(list => [...list, {
        id, name, amount: 0,
        notes: '', installments: [],
    }]);
    return id;
}

export function updateDebt(id: number, data: Partial<Omit<Debt, 'id'>>) {
    debts.update(list => list.map(d => d.id === id ? { ...d, ...data } : d));
}

export function deleteDebt(id: number) {
    debts.update(list => list.filter(d => d.id !== id));
}

export function formatRupiah(amount: number): string {
    const abs = Math.abs(amount);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + 'Rp ' + formatted;
}
