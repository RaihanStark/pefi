<script lang="ts">
    import type { TimelineEntry } from './stores';
    import { formatRupiah } from './stores';

    export let entries: TimelineEntry[];

    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();
    let selectedDate: string | null = null;

    function prevMonth() {
        if (viewMonth === 0) { viewYear--; viewMonth = 11; }
        else { viewMonth--; }
        selectedDate = null;
    }

    function nextMonth() {
        if (viewMonth === 11) { viewYear++; viewMonth = 0; }
        else { viewMonth++; }
        selectedDate = null;
    }

    function goToday() {
        viewYear = new Date().getFullYear();
        viewMonth = new Date().getMonth();
        selectedDate = null;
    }

    $: monthLabel = new Date(viewYear, viewMonth, 1)
        .toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

    $: entriesByDate = entries.reduce((map, e) => {
        if (!map[e.date]) map[e.date] = [];
        map[e.date].push(e);
        return map;
    }, {} as Record<string, TimelineEntry[]>);

    $: calendarDays = buildCalendarDays(viewYear, viewMonth);

    function buildCalendarDays(year: number, month: number): (number | null)[] {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }

    function dateStr(day: number): string {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${viewYear}-${m}-${d}`;
    }

    const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    $: selectedDayEntries = selectedDate ? (entriesByDate[selectedDate] ?? []) : [];
    $: todayStr = new Date().toISOString().slice(0, 10);
</script>

<div class="flex-1 flex min-h-0">
    <div class="flex flex-col {selectedDate ? 'w-1/2' : 'flex-1'} min-w-0">
        <!-- Month navigation -->
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1.5 border-b border-[#222] shrink-0">
            <button class="bg-transparent border-none text-[#888] hover:text-[#ff8c00] cursor-pointer text-xs tracking-wider transition-colors"
                on:click={prevMonth}>&lt; PREV</button>
            <button class="bg-transparent border-none text-[#ff8c00] font-bold text-xs tracking-wider cursor-pointer hover:text-[#e0e0e0] transition-colors"
                on:click={goToday}>{monthLabel}</button>
            <button class="bg-transparent border-none text-[#888] hover:text-[#ff8c00] cursor-pointer text-xs tracking-wider transition-colors"
                on:click={nextMonth}>NEXT &gt;</button>
        </div>

        <!-- Day-of-week headers -->
        <div class="grid grid-cols-7 bg-[#111] border-b border-[#222] shrink-0">
            {#each DOW as dow}
                <div class="text-center text-[10px] text-[#555] tracking-wider py-1">{dow}</div>
            {/each}
        </div>

        <!-- Day cells -->
        <div class="grid grid-cols-7 flex-1 overflow-auto auto-rows-fr">
            {#each calendarDays as day}
                {#if day === null}
                    <div class="border-b border-r border-[#1a1a1a] bg-[#0a0a0a]"></div>
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                    <div
                        class="border-b border-r border-[#1a1a1a] p-1.5 cursor-pointer transition-colors flex flex-col min-h-[60px]
                        {selectedDate === dateStr(day) ? 'bg-[#1a2332]' : 'bg-transparent hover:bg-[#111]'}
                        {dateStr(day) === todayStr ? 'ring-1 ring-inset ring-[#ff8c00]' : ''}"
                        on:click={() => selectedDate = selectedDate === dateStr(day) ? null : dateStr(day)}
                    >
                        <span class="text-[10px] {dateStr(day) === todayStr ? 'text-[#ff8c00] font-bold' : 'text-[#888]'}">{day}</span>
                        {#if entriesByDate[dateStr(day)]}
                            {@const dayEntries = entriesByDate[dateStr(day)]}
                            {@const total = dayEntries.reduce((s, e) => s + e.amount, 0)}
                            <div class="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1">
                                {#each dayEntries.slice(0, 2) as e}
                                    <span class="text-[8px] truncate px-0.5 rounded-sm leading-tight
                                        {e.amount < 0 ? 'bg-[#2a1515] text-[#cc3333]' : 'bg-[#1a2010] text-[#33cc33]'}">{e.description}</span>
                                {/each}
                                {#if dayEntries.length > 2}
                                    <span class="text-[8px] text-[#555]">+{dayEntries.length - 2} more</span>
                                {/if}
                            </div>
                            <span class="text-[9px] font-mono mt-auto {total < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(total)}</span>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    <!-- Day detail panel -->
    {#if selectedDate}
        <div class="w-1/2 flex flex-col border-l border-[#222] min-w-0">
            <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">{selectedDate}</span>
                <button class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                    on:click={() => selectedDate = null}>✕</button>
            </div>
            <div class="flex-1 overflow-auto">
                {#if selectedDayEntries.length === 0}
                    <div class="px-3 py-4 text-center text-[#555] text-xs">No events on this date</div>
                {:else}
                    {#each selectedDayEntries as entry}
                        <div class="px-3 py-2 border-b border-[#1a1a1a] text-xs">
                            <div class="flex items-center justify-between">
                                <span class="text-[#e0e0e0]">{entry.description}</span>
                                <span class="font-mono {entry.amount < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(entry.amount)}</span>
                            </div>
                            <div class="flex items-center gap-2 mt-0.5">
                                <span class="{entry.sourceType === 'debt' ? 'text-[#cc3333]' : 'text-[#ff8c00]'}">{entry.source}</span>
                                <span class="text-[#555]">{entry.category}</span>
                                {#if entry.status}
                                    <span class="{entry.status === 'paid' ? 'text-[#33cc33]' : entry.status === 'overdue' ? 'text-[#cc3333]' : 'text-[#888]'}">{entry.status.toUpperCase()}</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>
