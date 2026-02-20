<script lang="ts">
    export let account: string;

    interface Installment {
        month: string;
        amount: number;
        status: 'paid' | 'upcoming' | 'overdue';
        paidDate?: string;
    }

    interface Debt {
        name: string;
        amount: number;
        installmentAmount: number;
        tenor: number;
        paidCount: number;
        startDate: string;
        dueDate: string;
        nextDue: string;
        interestRate: number;
        notes: string;
        installments: Installment[];
    }

    let debts: Debt[] = [
        {
            name: 'Andi', amount: 5000000, installmentAmount: 1000000, tenor: 5, paidCount: 2,
            startDate: '2025-11-01', dueDate: '2026-04-01', nextDue: '2026-03-01',
            interestRate: 0, notes: 'Personal loan, no interest',
            installments: [
                { month: 'Nov 2025', amount: 1000000, status: 'paid', paidDate: '2025-11-05' },
                { month: 'Dec 2025', amount: 1000000, status: 'paid', paidDate: '2025-12-02' },
                { month: 'Jan 2026', amount: 1000000, status: 'paid', paidDate: '2026-01-03' },
                { month: 'Feb 2026', amount: 1000000, status: 'upcoming' },
                { month: 'Mar 2026', amount: 1000000, status: 'upcoming' },
            ],
        },
        {
            name: 'Budi', amount: 8000000, installmentAmount: 2000000, tenor: 4, paidCount: 1,
            startDate: '2026-01-15', dueDate: '2026-05-15', nextDue: '2026-02-15',
            interestRate: 0, notes: 'Business loan',
            installments: [
                { month: 'Jan 2026', amount: 2000000, status: 'paid', paidDate: '2026-01-15' },
                { month: 'Feb 2026', amount: 2000000, status: 'overdue' },
                { month: 'Mar 2026', amount: 2000000, status: 'upcoming' },
                { month: 'Apr 2026', amount: 2000000, status: 'upcoming' },
            ],
        },
        {
            name: 'Citra', amount: 7500000, installmentAmount: 2500000, tenor: 3, paidCount: 0,
            startDate: '2026-02-01', dueDate: '2026-05-01', nextDue: '2026-03-01',
            interestRate: 5, notes: 'Emergency fund',
            installments: [
                { month: 'Feb 2026', amount: 2500000, status: 'upcoming' },
                { month: 'Mar 2026', amount: 2500000, status: 'upcoming' },
                { month: 'Apr 2026', amount: 2500000, status: 'upcoming' },
            ],
        },
        {
            name: 'Dewi', amount: 6000000, installmentAmount: 1500000, tenor: 4, paidCount: 3,
            startDate: '2025-10-01', dueDate: '2026-02-01', nextDue: '2026-02-01',
            interestRate: 0, notes: 'Almost done',
            installments: [
                { month: 'Oct 2025', amount: 1500000, status: 'paid', paidDate: '2025-10-01' },
                { month: 'Nov 2025', amount: 1500000, status: 'paid', paidDate: '2025-11-03' },
                { month: 'Dec 2025', amount: 1500000, status: 'paid', paidDate: '2025-12-01' },
                { month: 'Jan 2026', amount: 1500000, status: 'overdue' },
            ],
        },
        {
            name: 'Eka', amount: 4500000, installmentAmount: 1500000, tenor: 3, paidCount: 1,
            startDate: '2026-01-01', dueDate: '2026-04-01', nextDue: '2026-02-01',
            interestRate: 0, notes: '',
            installments: [
                { month: 'Jan 2026', amount: 1500000, status: 'paid', paidDate: '2026-01-05' },
                { month: 'Feb 2026', amount: 1500000, status: 'upcoming' },
                { month: 'Mar 2026', amount: 1500000, status: 'upcoming' },
            ],
        },
        {
            name: 'Fajar', amount: 4000000, installmentAmount: 1000000, tenor: 4, paidCount: 0,
            startDate: '2026-02-10', dueDate: '2026-06-10', nextDue: '2026-03-10',
            interestRate: 2, notes: 'With 2% interest',
            installments: [
                { month: 'Feb 2026', amount: 1000000, status: 'upcoming' },
                { month: 'Mar 2026', amount: 1000000, status: 'upcoming' },
                { month: 'Apr 2026', amount: 1000000, status: 'upcoming' },
                { month: 'May 2026', amount: 1000000, status: 'upcoming' },
            ],
        },
    ];

    let selectedDebt: Debt | null = null;

    function formatRupiah(amount: number): string {
        return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

    $: total = debts.reduce((sum, d) => sum + d.amount, 0);
    $: remaining = selectedDebt ? selectedDebt.amount - (selectedDebt.paidCount * selectedDebt.installmentAmount) : 0;
</script>

<div class="flex-1 flex min-w-0">
    <!-- Debt table -->
    <div class="flex flex-col {selectedDebt ? 'w-1/2' : 'flex-1'} min-w-0">
        <div class="bg-[#1a1a1a] text-[#ff8c00] font-bold px-3 py-1 text-xs tracking-wider border-b border-[#222]">
            DEBTS — {account.toUpperCase()}
        </div>
        <div class="flex-1 overflow-auto">
            <table class="w-full border-collapse text-xs">
                <thead>
                    <tr class="sticky top-0 bg-[#111] text-[#555] tracking-wider">
                        <th class="text-left font-normal px-3 py-1.5 border-b border-[#222]">NAME</th>
                        <th class="text-right font-normal px-3 py-1.5 border-b border-[#222]">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {#each debts as debt}
                        <tr
                            class="border-b border-[#1a1a1a] cursor-pointer transition-colors
                            {selectedDebt === debt ? 'bg-[#1a2332] border-l-2 border-l-[#ff8c00]' : 'hover:bg-[#1a2332] border-l-2 border-l-transparent'}"
                            on:click={() => selectedDebt = selectedDebt === debt ? null : debt}
                        >
                            <td class="px-3 py-1.5 text-[#e0e0e0]">{debt.name}</td>
                            <td class="px-3 py-1.5 text-right font-mono text-[#cc3333]">{formatRupiah(debt.amount)}</td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr class="border-t border-[#333]">
                        <td class="px-3 py-1.5 text-[#888] font-bold">TOTAL</td>
                        <td class="px-3 py-1.5 text-right font-mono text-[#cc3333] font-bold">{formatRupiah(total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>

    <!-- Detail panel -->
    {#if selectedDebt}
        <div class="w-1/2 flex flex-col border-l border-[#222] min-w-0">
            <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">DETAIL — {selectedDebt.name.toUpperCase()}</span>
                <button
                    class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                    on:click={() => selectedDebt = null}
                >✕</button>
            </div>
            <div class="flex-1 overflow-auto p-3">
                <!-- Summary -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
                    <div>
                        <span class="text-[#555]">TOTAL DEBT</span>
                        <div class="font-mono text-[#cc3333]">{formatRupiah(selectedDebt.amount)}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">REMAINING</span>
                        <div class="font-mono text-[#cc3333]">{formatRupiah(remaining)}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">INSTALLMENT</span>
                        <div class="font-mono text-[#e0e0e0]">{formatRupiah(selectedDebt.installmentAmount)}/mo</div>
                    </div>
                    <div>
                        <span class="text-[#555]">TENOR</span>
                        <div class="text-[#e0e0e0]">{selectedDebt.paidCount}/{selectedDebt.tenor} months</div>
                    </div>
                    <div>
                        <span class="text-[#555]">START DATE</span>
                        <div class="text-[#e0e0e0]">{selectedDebt.startDate}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">DUE DATE</span>
                        <div class="text-[#e0e0e0]">{selectedDebt.dueDate}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">NEXT PAYMENT</span>
                        <div class="text-[#ff8c00]">{selectedDebt.nextDue}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">INTEREST</span>
                        <div class="text-[#e0e0e0]">{selectedDebt.interestRate}%</div>
                    </div>
                    {#if selectedDebt.notes}
                        <div class="col-span-2">
                            <span class="text-[#555]">NOTES</span>
                            <div class="text-[#888]">{selectedDebt.notes}</div>
                        </div>
                    {/if}
                </div>

                <!-- Progress bar -->
                <div class="mb-4">
                    <div class="flex justify-between text-[10px] text-[#555] mb-1">
                        <span>PROGRESS</span>
                        <span>{selectedDebt.paidCount}/{selectedDebt.tenor}</span>
                    </div>
                    <div class="h-1.5 bg-[#222] w-full">
                        <div
                            class="h-full bg-[#33cc33] transition-all"
                            style="width: {(selectedDebt.paidCount / selectedDebt.tenor) * 100}%"
                        ></div>
                    </div>
                </div>

                <!-- Installment schedule -->
                <div class="text-[10px] text-[#555] tracking-wider mb-1">INSTALLMENTS</div>
                <table class="w-full border-collapse text-xs">
                    <thead>
                        <tr class="text-[#555] tracking-wider">
                            <th class="text-left font-normal px-2 py-1 border-b border-[#222]">MONTH</th>
                            <th class="text-right font-normal px-2 py-1 border-b border-[#222]">AMOUNT</th>
                            <th class="text-right font-normal px-2 py-1 border-b border-[#222]">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each selectedDebt.installments as inst}
                            <tr class="border-b border-[#1a1a1a]">
                                <td class="px-2 py-1 text-[#e0e0e0]">{inst.month}</td>
                                <td class="px-2 py-1 text-right font-mono text-[#e0e0e0]">{formatRupiah(inst.amount)}</td>
                                <td class="px-2 py-1 text-right font-mono {statusColor(inst.status)}">
                                    {statusLabel(inst.status)}
                                    {#if inst.paidDate}
                                        <span class="text-[#555] ml-1">{inst.paidDate}</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>
