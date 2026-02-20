<script lang="ts">
    import { allTransactions, accounts, debts, buildTimelineEntries } from './stores';
    import TimelineList from './TimelineList.svelte';
    import TimelineCalendar from './TimelineCalendar.svelte';

    let subView: 'list' | 'calendar' = 'list';

    $: entries = buildTimelineEntries($allTransactions, $accounts, $debts);
</script>

<div class="flex-1 flex flex-col min-h-0">
    <!-- Sub-tab bar -->
    <div class="flex bg-[#111] border-b border-[#222] shrink-0">
        <button
            class="px-4 py-1.5 text-xs tracking-wider border-none cursor-pointer transition-colors
            {subView === 'list' ? 'bg-[#1a1a1a] text-[#ff8c00] border-b-2 border-b-[#ff8c00]' : 'bg-transparent text-[#888] hover:text-[#e0e0e0]'}"
            on:click={() => subView = 'list'}
        >LIST</button>
        <button
            class="px-4 py-1.5 text-xs tracking-wider border-none cursor-pointer transition-colors
            {subView === 'calendar' ? 'bg-[#1a1a1a] text-[#ff8c00] border-b-2 border-b-[#ff8c00]' : 'bg-transparent text-[#888] hover:text-[#e0e0e0]'}"
            on:click={() => subView = 'calendar'}
        >CALENDAR</button>
        <div class="ml-auto px-3 py-1.5 text-[10px] text-[#555] tracking-wider">{entries.length} ENTRIES</div>
    </div>

    {#if subView === 'list'}
        <TimelineList {entries} />
    {:else}
        <TimelineCalendar {entries} />
    {/if}
</div>
