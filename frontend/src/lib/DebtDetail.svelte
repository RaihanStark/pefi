<script lang="ts">
    import { debts, updateDebt, debtPaid, debtRemaining, formatRupiah } from './stores';
    import type { Debt, Installment } from './stores';

    export let debtId: number;

    let debt: Debt | undefined;
    $: debt = $debts.find(d => d.id === debtId);
    $: remaining = debt ? debtRemaining(debt) : 0;
    $: paid = debt ? debtPaid(debt) : 0;
    $: paidCount = debt ? debt.installments.filter(i => i.status === 'paid').length : 0;
    $: totalCount = debt ? debt.installments.length : 0;
    $: progressPct = debt && debt.amount > 0 ? (paid / debt.amount) * 100 : 0;
    $: nextDue = debt ? debt.installments
        .filter(i => i.status !== 'paid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate ?? '' : '';

    // Edit mode
    let editing = false;
    let formName = '';
    let formAmount = '';
    let formNotes = '';
    let formInstallments: { dueDate: string; amount: string }[] = [];

    $: hasInstallments = formInstallments.length > 0;
    $: installmentTotal = formInstallments.reduce((s, r) => s + (parseInt(r.amount) || 0), 0);

    function startEdit() {
        if (!debt) return;
        formName = debt.name;
        formAmount = debt.amount ? debt.amount.toString() : '';
        formNotes = debt.notes;
        formInstallments = debt.installments.map(i => ({
            dueDate: i.dueDate,
            amount: i.amount ? i.amount.toString() : '',
        }));
        editing = true;
    }

    function cancelEdit() {
        editing = false;
    }

    function addRow() {
        formInstallments = [...formInstallments, { dueDate: '', amount: '' }];
    }

    function removeRow(idx: number) {
        formInstallments = formInstallments.filter((_, i) => i !== idx);
    }

    async function saveEdit() {
        if (!debt) return;
        const amount = hasInstallments ? installmentTotal : (parseInt(formAmount) || 0);
        const installments: Installment[] = formInstallments.map((r, i) => {
            const existing = debt!.installments[i];
            return {
                dueDate: r.dueDate,
                amount: parseInt(r.amount) || 0,
                status: existing?.status ?? 'upcoming',
                paidDate: existing?.paidDate ?? '',
            };
        });
        await updateDebt(debtId, {
            name: formName.trim(),
            amount,
            notes: formNotes,
            installments,
        });
        editing = false;
    }

    async function togglePaid(idx: number) {
        if (!debt) return;
        const inst = debt.installments[idx];
        const updated = [...debt.installments];
        if (inst.status === 'paid') {
            updated[idx] = { ...inst, status: 'upcoming', paidDate: '' };
        } else {
            const today = new Date().toISOString().slice(0, 10);
            updated[idx] = { ...inst, status: 'paid', paidDate: today };
        }
        await updateDebt(debtId, { installments: updated });
    }

    function statusColor(status: string): string {
        if (status === 'paid') return 'text-[#33cc33]';
        if (status === 'overdue') return 'text-[#cc3333]';
        return 'text-[#888]';
    }

    function statusLabel(status: string): string {
        if (status === 'paid') return 'PAID';
        if (status === 'overdue') return 'OVERDUE';
        return 'UPCOMING';
    }
</script>

{#if debt}
    <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">DEBT — {debt.name.toUpperCase()}</span>
            {#if !editing}
                <button
                    class="bg-transparent border-none text-[#555] hover:text-[#ff8c00] cursor-pointer text-xs transition-colors tracking-wider"
                    on:click={startEdit}
                >EDIT</button>
            {/if}
        </div>
        <div class="flex-1 overflow-auto p-4">
            {#if editing}
                <form class="max-w-2xl text-xs flex flex-col gap-3" on:submit|preventDefault={saveEdit}>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-[#555] tracking-wider" for="edit-name">NAME</label>
                            <input id="edit-name" class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors" type="text" bind:value={formName} required />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[#555] tracking-wider" for="edit-amount">TOTAL AMOUNT {hasInstallments ? '(auto)' : ''}</label>
                            <div class="flex items-center bg-[#1a1a1a] border border-[#333] transition-colors {hasInstallments ? 'opacity-50' : 'focus-within:border-[#ff8c00]'}">
                                <span class="text-[#555] pl-2">Rp</span>
                                {#if hasInstallments}
                                    <input class="bg-transparent border-none text-[#e0e0e0] px-2 py-1.5 outline-none flex-1 font-mono cursor-not-allowed" type="text" value={installmentTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} disabled />
                                {:else}
                                    <input id="edit-amount" class="bg-transparent border-none text-[#e0e0e0] px-2 py-1.5 outline-none flex-1 font-mono" type="number" bind:value={formAmount} min="0" />
                                {/if}
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[#555] tracking-wider" for="edit-notes">NOTES</label>
                            <input id="edit-notes" class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors" type="text" bind:value={formNotes} />
                        </div>
                    </div>

                    <!-- Installment rows -->
                    <div class="mt-2">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[#555] tracking-wider">INSTALLMENTS</span>
                            <button type="button" class="bg-transparent border-none text-[#555] hover:text-[#ff8c00] cursor-pointer text-xs transition-colors" on:click={addRow}>+ Add</button>
                        </div>
                        {#if formInstallments.length > 0}
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="text-[#555] tracking-wider text-[10px]">
                                        <th class="text-left font-normal px-2 py-1 border-b border-[#222] w-10">#</th>
                                        <th class="text-left font-normal px-2 py-1 border-b border-[#222]">DUE DATE</th>
                                        <th class="text-left font-normal px-2 py-1 border-b border-[#222]">AMOUNT</th>
                                        <th class="text-right font-normal px-2 py-1 border-b border-[#222] w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each formInstallments as row, i}
                                        <tr class="border-b border-[#1a1a1a]">
                                            <td class="px-2 py-1 text-[#555]">{i + 1}</td>
                                            <td class="px-2 py-0.5">
                                                <input class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1 outline-none focus:border-[#ff8c00] transition-colors w-full" type="date" bind:value={row.dueDate} />
                                            </td>
                                            <td class="px-2 py-0.5">
                                                <div class="flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-[#ff8c00] transition-colors">
                                                    <span class="text-[#555] pl-2 text-[10px]">Rp</span>
                                                    <input class="bg-transparent border-none text-[#e0e0e0] px-2 py-1 outline-none flex-1 font-mono w-full" type="number" bind:value={row.amount} min="0" />
                                                </div>
                                            </td>
                                            <td class="px-2 py-0.5 text-right">
                                                <button type="button" class="bg-transparent border-none text-[#555] hover:text-[#cc3333] cursor-pointer transition-colors" on:click={() => removeRow(i)}>✕</button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                                <tfoot>
                                    <tr class="border-t border-[#333]">
                                        <td class="px-2 py-1"></td>
                                        <td class="px-2 py-1 text-[#888] font-bold">TOTAL</td>
                                        <td class="px-2 py-1 font-mono text-[#e0e0e0] font-bold">{formatRupiah(installmentTotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        {:else}
                            <div class="text-[#555] py-2">No installments. Add rows or enter a total amount above.</div>
                        {/if}
                    </div>

                    <div class="flex gap-2 mt-2">
                        <button
                            type="button"
                            class="bg-[#1a1a1a] border border-[#333] text-[#888] px-4 py-1.5 cursor-pointer hover:border-[#555] hover:text-[#e0e0e0] transition-colors"
                            on:click={cancelEdit}
                        >Cancel</button>
                        <button
                            type="submit"
                            class="bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-4 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors font-bold"
                            disabled={!formName.trim()}
                        >Save</button>
                    </div>
                </form>
            {:else}
                {#if debt.amount > 0}
                    <!-- Summary grid -->
                    <div class="grid grid-cols-4 gap-x-6 gap-y-3 text-xs mb-5">
                        <div>
                            <span class="text-[#555]">TOTAL DEBT</span>
                            <div class="font-mono text-[#cc3333]">{formatRupiah(debt.amount)}</div>
                        </div>
                        <div>
                            <span class="text-[#555]">REMAINING</span>
                            <div class="font-mono text-[#cc3333]">{formatRupiah(remaining)}</div>
                        </div>
                        <div>
                            <span class="text-[#555]">PAID</span>
                            <div class="font-mono text-[#33cc33]">{formatRupiah(paid)}</div>
                        </div>
                        {#if nextDue}
                            <div>
                                <span class="text-[#555]">NEXT DUE</span>
                                <div class="text-[#ff8c00]">{nextDue}</div>
                            </div>
                        {/if}
                        {#if debt.notes}
                            <div class="col-span-4">
                                <span class="text-[#555]">NOTES</span>
                                <div class="text-[#888]">{debt.notes}</div>
                            </div>
                        {/if}
                    </div>

                    <!-- Progress bar -->
                    {#if totalCount > 0}
                        <div class="mb-5 max-w-md">
                            <div class="flex justify-between text-[10px] text-[#555] mb-1">
                                <span>PROGRESS</span>
                                <span>{paidCount}/{totalCount} ({Math.round(progressPct)}%)</span>
                            </div>
                            <div class="h-1.5 bg-[#222] w-full">
                                <div
                                    class="h-full bg-[#33cc33] transition-all"
                                    style="width: {progressPct}%"
                                ></div>
                            </div>
                        </div>
                    {/if}

                    <!-- Installment schedule -->
                    {#if debt.installments.length > 0}
                        <div class="text-[10px] text-[#555] tracking-wider mb-1">INSTALLMENTS</div>
                        <table class="w-full border-collapse text-xs max-w-xl">
                            <thead>
                                <tr class="text-[#555] tracking-wider">
                                    <th class="text-left font-normal px-2 py-1 border-b border-[#222] w-8">#</th>
                                    <th class="text-left font-normal px-2 py-1 border-b border-[#222]">DUE DATE</th>
                                    <th class="text-right font-normal px-2 py-1 border-b border-[#222]">AMOUNT</th>
                                    <th class="text-right font-normal px-2 py-1 border-b border-[#222]">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each debt.installments as inst, i}
                                    <tr class="border-b border-[#1a1a1a] cursor-pointer hover:bg-[#1a1a1a] transition-colors" on:click={() => togglePaid(i)}>
                                        <td class="px-2 py-1.5 text-[#555]">{i + 1}</td>
                                        <td class="px-2 py-1.5 text-[#e0e0e0] {inst.status === 'paid' ? 'line-through opacity-50' : ''}">{inst.dueDate}</td>
                                        <td class="px-2 py-1.5 text-right font-mono text-[#e0e0e0] {inst.status === 'paid' ? 'line-through opacity-50' : ''}">{formatRupiah(inst.amount)}</td>
                                        <td class="px-2 py-1.5 text-right">
                                            <span class="inline-flex items-center gap-1.5 font-mono {statusColor(inst.status)}">
                                                <span class="inline-block w-2 h-2 rounded-full {inst.status === 'paid' ? 'bg-[#33cc33]' : inst.status === 'overdue' ? 'bg-[#cc3333]' : 'bg-[#555]'}"></span>
                                                {statusLabel(inst.status)}
                                            </span>
                                            {#if inst.paidDate}
                                                <span class="text-[#555] ml-1">{inst.paidDate}</span>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                {:else}
                    <div class="flex flex-col items-center justify-center text-[#555] text-xs py-12 gap-3">
                        <span>No details yet.</span>
                        <button
                            class="bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-4 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors font-bold text-xs"
                            on:click={startEdit}
                        >Set Up Debt</button>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{:else}
    <div class="flex-1 flex items-center justify-center text-[#555] text-xs">Debt not found</div>
{/if}
