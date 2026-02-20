import { writable, derived } from 'svelte/store';

export interface Account {
    id: string;
    name: string;
    type: 'bank' | 'debt';
    balance: number;
}

let nextId = 1;
function genId(): string {
    return `acc-${nextId++}`;
}

export const accounts = writable<Account[]>([
    { id: genId(), name: 'Checking', type: 'bank', balance: 2450000 },
    { id: genId(), name: 'Savings', type: 'bank', balance: 8200000 },
    { id: genId(), name: 'Peer To Peer', type: 'debt', balance: -35000000 },
]);

export const bankAccounts = derived(accounts, $a => $a.filter(a => a.type === 'bank'));
export const debtAccounts = derived(accounts, $a => $a.filter(a => a.type === 'debt'));

export function addAccount(name: string, type: 'bank' | 'debt', balance: number) {
    accounts.update(list => [...list, { id: genId(), name, type, balance }]);
}

export function updateAccount(id: string, data: Partial<Omit<Account, 'id'>>) {
    accounts.update(list => list.map(a => a.id === id ? { ...a, ...data } : a));
}

export function deleteAccount(id: string) {
    accounts.update(list => list.filter(a => a.id !== id));
}

// Transactions

export interface Transaction {
    id: string;
    accountId: string;
    date: string;
    name: string;
    amount: number;
    category: string;
    notes: string;
}

let nextTxId = 1;
function genTxId(): string {
    return `tx-${nextTxId++}`;
}

export const transactions = writable<Transaction[]>([
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-20', name: 'Grocery Store', amount: -85420, category: 'Food & Groceries', notes: 'Weekly groceries' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-19', name: 'Salary Deposit', amount: 3200000, category: 'Income', notes: 'Monthly salary Feb 2026' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-18', name: 'Electric Bill', amount: -120000, category: 'Utilities', notes: 'PLN monthly bill' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-17', name: 'Transfer to Savings', amount: -500000, category: 'Transfer', notes: 'Monthly savings allocation' },
    { id: genTxId(), accountId: 'acc-2', date: '2026-02-17', name: 'Transfer from Checking', amount: 500000, category: 'Transfer', notes: 'Monthly savings allocation' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-12', name: 'Phone Bill', amount: -45000, category: 'Utilities', notes: 'Telkomsel postpaid' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-10', name: 'Freelance Payment', amount: 650000, category: 'Income', notes: 'Logo design project' },
    { id: genTxId(), accountId: 'acc-1', date: '2026-02-01', name: 'Rent', amount: -800000, category: 'Housing', notes: 'Monthly rent Feb 2026' },
]);

export function addTransaction(tx: Omit<Transaction, 'id'>) {
    transactions.update(list => [...list, { ...tx, id: genTxId() }]);
}

export function deleteTransaction(id: string) {
    transactions.update(list => list.filter(t => t.id !== id));
}

// Categories

export const expenseCategories = writable<string[]>([
    'Food & Groceries', 'Food & Dining', 'Utilities', 'Housing', 'Transfer',
    'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other',
]);

export const incomeCategories = writable<string[]>([
    'Salary', 'Freelance', 'Investment', 'Transfer', 'Gift', 'Refund', 'Other',
]);

export function addCategory(type: 'expense' | 'income', name: string) {
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.includes(name) ? list : [...list, name]);
}

export function renameCategory(type: 'expense' | 'income', oldName: string, newName: string) {
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.map(c => c === oldName ? newName : c));
    // Also update existing transactions
    transactions.update(list => list.map(t => t.category === oldName ? { ...t, category: newName } : t));
}

export function deleteCategory(type: 'expense' | 'income', name: string) {
    const store = type === 'expense' ? expenseCategories : incomeCategories;
    store.update(list => list.filter(c => c !== name));
}

export function formatRupiah(amount: number): string {
    const abs = Math.abs(amount);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + 'Rp ' + formatted;
}
