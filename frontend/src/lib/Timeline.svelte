<script lang="ts">
    import { transactions, addTransaction, deleteTransaction, formatRupiah, expenseCategories, incomeCategories } from './stores';
    import type { Transaction } from './stores';

    export let accountId: string;
    export let accountName: string;

    let selectedTx: Transaction | null = null;

    // New transaction form
    let showForm = false;
    let formName = '';
    let formAmount = '';
    let formCategory = 'Other';
    let formNotes = '';
    let formDate = new Date().toISOString().slice(0, 10);
    let formIsExpense = true;
    let showCategoryPicker = false;

    $: filtered = $transactions.filter(t => t.accountId === accountId).sort((a, b) => b.date.localeCompare(a.date));

    function resetForm() {
        formName = '';
        formAmount = '';
        formCategory = 'Other';
        formNotes = '';
        formDate = new Date().toISOString().slice(0, 10);
        formIsExpense = true;
        showForm = false;
        showCategoryPicker = false;
    }

    function submitForm() {
        const amount = parseInt(formAmount) || 0;
        if (!formName.trim() || !amount) return;
        addTransaction({
            accountId,
            date: formDate,
            name: formName.trim(),
            amount: formIsExpense ? -Math.abs(amount) : Math.abs(amount),
            category: formCategory,
            notes: formNotes,
        });
        resetForm();
    }

    function pickCategory(cat: string) {
        formCategory = cat;
        showCategoryPicker = false;
    }

    $: categories = formIsExpense ? $expenseCategories : $incomeCategories;
    // Reset category when switching type if current pick isn't in the new list
    $: if (!categories.includes(formCategory)) formCategory = categories[0] ?? 'Other';
</script>

<div class="flex-1 flex min-w-0">
    <!-- Transaction table -->
    <div class="flex flex-col {selectedTx || showForm ? 'w-1/2' : 'flex-1'} min-w-0">
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">TRANSACTIONS — {accountName.toUpperCase()}</span>
            <button
                class="bg-transparent border-none text-[#555] hover:text-[#ff8c00] cursor-pointer text-sm leading-none transition-colors"
                on:click={() => { selectedTx = null; showForm = !showForm; }}
            >+</button>
        </div>
        <div class="flex-1 overflow-auto">
            <table class="w-full border-collapse text-xs">
                <thead>
                    <tr class="sticky top-0 bg-[#111] text-[#555] tracking-wider">
                        <th class="text-left font-normal px-3 py-1.5 border-b border-[#222]">DATE</th>
                        <th class="text-left font-normal px-3 py-1.5 border-b border-[#222]">DESCRIPTION</th>
                        <th class="text-right font-normal px-3 py-1.5 border-b border-[#222]">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filtered as tx}
                        <tr
                            class="border-b border-[#1a1a1a] cursor-pointer transition-colors
                            {selectedTx?.id === tx.id ? 'bg-[#1a2332] border-l-2 border-l-[#ff8c00]' : 'hover:bg-[#1a2332] border-l-2 border-l-transparent'}"
                            on:click={() => { showForm = false; selectedTx = selectedTx?.id === tx.id ? null : tx; }}
                        >
                            <td class="px-3 py-1.5 text-[#888]">{tx.date}</td>
                            <td class="px-3 py-1.5 text-[#e0e0e0]">{tx.name}</td>
                            <td class="px-3 py-1.5 text-right font-mono {tx.amount < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">
                                {formatRupiah(tx.amount)}
                            </td>
                        </tr>
                    {/each}
                    {#if filtered.length === 0}
                        <tr>
                            <td colspan="3" class="px-3 py-4 text-center text-[#555]">No transactions</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>

    <!-- New transaction form -->
    {#if showForm}
        <div class="w-1/2 flex flex-col border-l border-[#222] min-w-0">
            <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">NEW TRANSACTION</span>
                <button
                    class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                    on:click={resetForm}
                >✕</button>
            </div>
            <form class="flex-1 overflow-auto p-3 flex flex-col gap-3 text-xs" on:submit|preventDefault={submitForm}>
                <div class="flex flex-col gap-1">
                    <label class="text-[#555] tracking-wider" for="tx-name">DESCRIPTION</label>
                    <input id="tx-name" class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors" type="text" bind:value={formName} placeholder="Transaction name" required />
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[#555] tracking-wider">TYPE</label>
                    <div class="flex gap-2">
                        <button type="button" class="flex-1 px-2 py-1.5 border cursor-pointer transition-colors {formIsExpense ? 'bg-[#2a1515] border-[#cc3333] text-[#cc3333]' : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#555]'}" on:click={() => formIsExpense = true}>Expense</button>
                        <button type="button" class="flex-1 px-2 py-1.5 border cursor-pointer transition-colors {!formIsExpense ? 'bg-[#152a15] border-[#33cc33] text-[#33cc33]' : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#555]'}" on:click={() => formIsExpense = false}>Income</button>
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[#555] tracking-wider" for="tx-amount">AMOUNT</label>
                    <div class="flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-[#ff8c00] transition-colors">
                        <span class="text-[#555] pl-2">Rp</span>
                        <input id="tx-amount" class="bg-transparent border-none text-[#e0e0e0] px-2 py-1.5 outline-none flex-1 font-mono" type="number" bind:value={formAmount} placeholder="0" min="0" required />
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[#555] tracking-wider" for="tx-date">DATE</label>
                    <input id="tx-date" class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors" type="date" bind:value={formDate} />
                </div>

                <div class="flex flex-col gap-1 relative">
                    <label class="text-[#555] tracking-wider">CATEGORY</label>
                    <button
                        type="button"
                        class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 text-left cursor-pointer hover:border-[#ff8c00] transition-colors flex items-center justify-between"
                        on:click={() => showCategoryPicker = !showCategoryPicker}
                    >
                        <span>{formCategory}</span>
                        <span class="text-[#555] text-[10px]">{showCategoryPicker ? '▲' : '▼'}</span>
                    </button>
                    {#if showCategoryPicker}
                        <div class="absolute top-full left-0 right-0 mt-0.5 bg-[#1a1a1a] border border-[#333] z-10 max-h-40 overflow-y-auto">
                            {#each categories as cat}
                                <button
                                    type="button"
                                    class="w-full text-left px-2 py-1.5 border-none cursor-pointer transition-colors
                                    {formCategory === cat ? 'bg-[#1a2332] text-[#ff8c00]' : 'bg-transparent text-[#e0e0e0] hover:bg-[#1a2332] hover:text-[#ff8c00]'}"
                                    on:click={() => pickCategory(cat)}
                                >{cat}</button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[#555] tracking-wider" for="tx-notes">NOTES</label>
                    <input id="tx-notes" class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors" type="text" bind:value={formNotes} placeholder="Optional" />
                </div>

                <div class="flex gap-2 mt-1">
                    <button type="button" class="flex-1 bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1.5 cursor-pointer hover:border-[#555] hover:text-[#e0e0e0] transition-colors" on:click={resetForm}>Cancel</button>
                    <button type="submit" class="flex-1 bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-3 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors font-bold" disabled={!formName.trim() || !formAmount}>Add</button>
                </div>
            </form>
        </div>
    {/if}

    <!-- Detail panel -->
    {#if selectedTx && !showForm}
        <div class="w-1/2 flex flex-col border-l border-[#222] min-w-0">
            <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">DETAIL — {selectedTx.name.toUpperCase()}</span>
                <button
                    class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                    on:click={() => selectedTx = null}
                >✕</button>
            </div>
            <div class="flex-1 overflow-auto p-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                        <span class="text-[#555]">AMOUNT</span>
                        <div class="font-mono text-lg {selectedTx.amount < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(selectedTx.amount)}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">DATE</span>
                        <div class="text-[#e0e0e0]">{selectedTx.date}</div>
                    </div>
                    <div class="col-span-2">
                        <span class="text-[#555]">CATEGORY</span>
                        <div class="text-[#e0e0e0]">{selectedTx.category}</div>
                    </div>
                    {#if selectedTx.notes}
                        <div class="col-span-2">
                            <span class="text-[#555]">NOTES</span>
                            <div class="text-[#888]">{selectedTx.notes}</div>
                        </div>
                    {/if}
                </div>

                <button
                    class="mt-4 bg-[#1a1a1a] border border-[#cc3333] text-[#cc3333] px-3 py-1.5 cursor-pointer hover:bg-[#cc3333] hover:text-black transition-colors text-xs"
                    on:click={() => { deleteTransaction(selectedTx.id); selectedTx = null; }}
                >Delete Transaction</button>
            </div>
        </div>
    {/if}
</div>
