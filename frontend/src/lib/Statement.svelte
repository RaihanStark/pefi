<script lang="ts">
    import { allTransactions, bills, debts, formatRupiah } from './stores';
    import type { Transaction, Bill, Debt } from './stores';

    let viewYear = new Date().getFullYear();

    function prevYear() { viewYear--; }
    function nextYear() { viewYear++; }

    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    interface LineItem {
        label: string;
        months: number[];
    }

    interface Section {
        name: string;
        items: LineItem[];
        sign: 1 | -1;
    }

    function txToLineItems(txs: Transaction[], year: number, filter: (t: Transaction) => boolean): LineItem[] {
        const filtered = txs.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && filter(t);
        });

        const byCategory = new Map<string, number[]>();
        for (const t of filtered) {
            const month = new Date(t.date).getMonth();
            const cat = t.category || 'Uncategorized';
            if (!byCategory.has(cat)) byCategory.set(cat, new Array(12).fill(0));
            byCategory.get(cat)![month] += Math.abs(t.amount);
        }

        return Array.from(byCategory.entries())
            .map(([label, months]) => ({ label, months }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    function billsToLineItems(billList: Bill[]): LineItem[] {
        return billList.map(b => ({
            label: b.name,
            months: new Array(12).fill(b.amount),
        }));
    }

    function debtsToLineItems(debtList: Debt[], year: number): LineItem[] {
        const byDebt = new Map<string, number[]>();
        for (const d of debtList) {
            const months = new Array(12).fill(0);
            for (const inst of d.installments) {
                const date = new Date(inst.dueDate);
                if (date.getFullYear() === year) {
                    months[date.getMonth()] += inst.amount;
                }
            }
            if (months.some(v => v > 0)) {
                byDebt.set(d.name, months);
            }
        }
        return Array.from(byDebt.entries())
            .map(([label, months]) => ({ label, months }));
    }

    function buildSections(txs: Transaction[], billList: Bill[], debtList: Debt[], year: number): Section[] {
        const income = txToLineItems(txs, year, t => t.amount > 0);
        const expenses = txToLineItems(txs, year, t => t.amount < 0);
        const billItems = billsToLineItems(billList);
        const debtItems = debtsToLineItems(debtList, year);

        return [
            { name: 'INCOME', sign: 1, items: income },
            { name: 'EXPENSES', sign: -1, items: expenses },
            ...(billItems.length > 0 ? [{ name: 'BILLS', sign: -1 as const, items: billItems }] : []),
            ...(debtItems.length > 0 ? [{ name: 'DEBT PAYMENTS', sign: -1 as const, items: debtItems }] : []),
        ];
    }

    $: sections = buildSections($allTransactions, $bills, $debts, viewYear);

    function sectionTotals(section: Section): number[] {
        return MONTHS.map((_, mi) =>
            section.items.reduce((sum, item) => sum + item.months[mi], 0) * section.sign
        );
    }

    $: allSectionTotals = sections.map(s => sectionTotals(s));

    // Inflow = income sections (sign 1), Outflow = expense sections (sign -1)
    $: inflow = MONTHS.map((_, mi) =>
        sections.reduce((sum, s, si) => sum + (s.sign === 1 ? allSectionTotals[si][mi] : 0), 0)
    );

    $: outflow = MONTHS.map((_, mi) =>
        sections.reduce((sum, s, si) => sum + (s.sign === -1 ? allSectionTotals[si][mi] : 0), 0)
    );

    $: netIncome = MONTHS.map((_, mi) => inflow[mi] + outflow[mi]);

    function rowTotal(months: number[]): number {
        return months.reduce((s, v) => s + v, 0);
    }

    function itemTotal(item: LineItem, sign: number): number {
        return rowTotal(item.months) * sign;
    }

    function displayVal(val: number, sign: number): number {
        return val * sign;
    }
</script>

<div class="flex-1 flex flex-col min-h-0">
    <!-- Year navigation -->
    <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1.5 border-b border-[#222] shrink-0">
        <button class="bg-transparent border-none text-[#888] hover:text-[#ff8c00] cursor-pointer text-xs tracking-wider transition-colors"
            on:click={prevYear}>&lt; PREV</button>
        <span class="text-[#ff8c00] font-bold text-xs tracking-wider">{viewYear} STATEMENT</span>
        <button class="bg-transparent border-none text-[#888] hover:text-[#ff8c00] cursor-pointer text-xs tracking-wider transition-colors"
            on:click={nextYear}>NEXT &gt;</button>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
        <table class="w-full border-collapse text-xs min-w-[900px]">
            <thead>
                <tr class="sticky top-0 bg-[#111] z-10">
                    <th class="text-left font-normal px-3 py-1.5 border-b border-[#222] text-[#555] tracking-wider sticky left-0 bg-[#111] z-20 min-w-[160px]"></th>
                    {#each MONTHS as m}
                        <th class="text-right font-normal px-2 py-1.5 border-b border-[#222] text-[#555] tracking-wider min-w-[90px]">{m}</th>
                    {/each}
                    <th class="text-right font-bold px-3 py-1.5 border-b border-[#222] text-[#ff8c00] tracking-wider min-w-[100px]">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                {#each sections as section, si}
                    <!-- Section header -->
                    <tr>
                        <td colspan="14" class="px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222] sticky left-0">
                            <span class="text-[#ff8c00] font-bold tracking-wider">{section.name}</span>
                        </td>
                    </tr>
                    <!-- Line items -->
                    {#each section.items as item}
                        <tr class="hover:bg-[#111] transition-colors">
                            <td class="px-3 py-1 pl-6 text-[#ccc] border-b border-[#1a1a1a] sticky left-0 bg-[#0a0a0a]">{item.label}</td>
                            {#each item.months as val}
                                <td class="px-2 py-1 text-right font-mono border-b border-[#1a1a1a] {displayVal(val, section.sign) < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(displayVal(val, section.sign))}</td>
                            {/each}
                            <td class="px-3 py-1 text-right font-mono font-bold border-b border-[#1a1a1a] {itemTotal(item, section.sign) < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(itemTotal(item, section.sign))}</td>
                        </tr>
                    {/each}
                    <!-- Section total -->
                    <tr class="border-t border-[#333]">
                        <td class="px-3 py-1.5 pl-6 text-[#888] font-bold border-b border-[#222] sticky left-0 bg-[#0a0a0a]">Total {section.name.charAt(0) + section.name.slice(1).toLowerCase()}</td>
                        {#each allSectionTotals[si] as val}
                            <td class="px-2 py-1.5 text-right font-mono font-bold border-b border-[#222] {val < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(val)}</td>
                        {/each}
                        <td class="px-3 py-1.5 text-right font-mono font-bold border-b border-[#222] {rowTotal(allSectionTotals[si]) < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(rowTotal(allSectionTotals[si]))}</td>
                    </tr>
                    <!-- Spacer between sections -->
                    {#if si < sections.length - 1}
                        <tr><td colspan="14" class="py-1"></td></tr>
                    {/if}
                {/each}

                <!-- Outflow -->
                <tr class="border-t border-[#333]">
                    <td class="px-3 py-1.5 text-[#cc3333] font-bold tracking-wider border-b border-[#222] sticky left-0 bg-[#0a0a0a]">MONEY OUT</td>
                    {#each outflow as val}
                        <td class="px-2 py-1.5 text-right font-mono font-bold border-b border-[#222] text-[#cc3333]">{formatRupiah(val)}</td>
                    {/each}
                    <td class="px-3 py-1.5 text-right font-mono font-bold border-b border-[#222] text-[#cc3333]">{formatRupiah(rowTotal(outflow))}</td>
                </tr>
                <!-- Net Income -->
                <tr class="border-t-2 border-[#ff8c00]">
                    <td class="px-3 py-2 text-[#ff8c00] font-bold tracking-wider border-b border-[#222] sticky left-0 bg-[#0a0a0a]">NET INCOME</td>
                    {#each netIncome as val}
                        <td class="px-2 py-2 text-right font-mono font-bold border-b border-[#222] {val < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(val)}</td>
                    {/each}
                    <td class="px-3 py-2 text-right font-mono font-bold text-lg border-b border-[#222] {rowTotal(netIncome) < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(rowTotal(netIncome))}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
