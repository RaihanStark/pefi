<script lang="ts">
    import type { TimelineEntry } from './stores';
    import { formatRupiah } from './stores';

    export let entries: TimelineEntry[];

    let selectedEntry: TimelineEntry | null = null;

    interface DayGroup {
        date: string;
        entries: TimelineEntry[];
        total: number;
    }

    function formatDate(iso: string): string {
        const [y, m, d] = iso.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    $: grouped = entries.reduce((groups, e) => {
        const last = groups[groups.length - 1];
        if (last && last.date === e.date) {
            last.entries.push(e);
            last.total += e.amount;
        } else {
            groups.push({ date: e.date, entries: [e], total: e.amount });
        }
        return groups;
    }, [] as DayGroup[]);

    function statusBadge(status: string | undefined): string {
        if (status === 'paid') return 'text-[#33cc33]';
        if (status === 'overdue') return 'text-[#cc3333]';
        return 'text-[#888]';
    }

    function sourceColor(entry: TimelineEntry): string {
        return entry.sourceType === 'debt' ? 'text-[#cc3333]' : 'text-[#ff8c00]';
    }
</script>

<div class="flex-1 flex min-w-0 min-h-0">
    <div class="flex flex-col {selectedEntry ? 'w-1/2' : 'flex-1'} min-w-0">
        <div class="flex-1 overflow-auto">
            <table class="w-full border-collapse text-xs">
                <thead>
                    <tr class="sticky top-0 bg-[#111] text-[#555] tracking-wider z-10">
                        <th class="text-left font-normal px-3 py-1.5 border-b border-[#222]">DESCRIPTION</th>
                        <th class="text-left font-normal px-3 py-1.5 border-b border-[#222]">SOURCE</th>
                        <th class="text-right font-normal px-3 py-1.5 border-b border-[#222]">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {#each grouped as group}
                        <tr class="sticky top-[29px] z-[5]">
                            <td colspan="3" class="px-3 py-1 bg-[#151515] border-b border-[#222]">
                                <div class="flex items-center justify-between">
                                    <span class="text-[#ff8c00] font-bold tracking-wider">{formatDate(group.date)}</span>
                                    <span class="font-mono {group.total < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(group.total)}</span>
                                </div>
                            </td>
                        </tr>
                        {#each group.entries as entry}
                            <tr
                                class="border-b border-[#1a1a1a] cursor-pointer transition-colors
                                {selectedEntry?.id === entry.id ? 'bg-[#1a2332] border-l-2 border-l-[#ff8c00]' : 'hover:bg-[#1a2332] border-l-2 border-l-transparent'}"
                                on:click={() => selectedEntry = selectedEntry?.id === entry.id ? null : entry}
                            >
                                <td class="px-3 py-1.5 text-[#e0e0e0]">
                                    {entry.description}
                                    {#if entry.status}
                                        <span class="ml-1.5 text-[10px] {statusBadge(entry.status)}">{entry.status.toUpperCase()}</span>
                                    {/if}
                                </td>
                                <td class="px-3 py-1.5 {sourceColor(entry)}">{entry.source}</td>
                                <td class="px-3 py-1.5 text-right font-mono {entry.amount < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">
                                    {formatRupiah(entry.amount)}
                                </td>
                            </tr>
                        {/each}
                    {/each}
                    {#if entries.length === 0}
                        <tr>
                            <td colspan="3" class="px-3 py-4 text-center text-[#555]">No entries</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>

    {#if selectedEntry}
        <div class="w-1/2 flex flex-col border-l border-[#222] min-w-0">
            <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">DETAIL</span>
                <button class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                    on:click={() => selectedEntry = null}>✕</button>
            </div>
            <div class="flex-1 overflow-auto p-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                        <span class="text-[#555]">AMOUNT</span>
                        <div class="font-mono text-lg {selectedEntry.amount < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(selectedEntry.amount)}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">DATE</span>
                        <div class="text-[#e0e0e0]">{selectedEntry.date}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">SOURCE</span>
                        <div class="{sourceColor(selectedEntry)}">{selectedEntry.source}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">TYPE</span>
                        <div class="text-[#e0e0e0]">{selectedEntry.sourceType === 'debt' ? 'DEBT INSTALLMENT' : 'TRANSACTION'}</div>
                    </div>
                    <div>
                        <span class="text-[#555]">CATEGORY</span>
                        <div class="text-[#e0e0e0]">{selectedEntry.category}</div>
                    </div>
                    {#if selectedEntry.status}
                        <div>
                            <span class="text-[#555]">STATUS</span>
                            <div class="{statusBadge(selectedEntry.status)}">{selectedEntry.status.toUpperCase()}</div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
