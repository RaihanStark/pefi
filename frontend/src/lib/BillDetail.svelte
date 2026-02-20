<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { bills, formatRupiah } from './stores';
    import type { Bill } from './stores';

    export let billId: number;

    const dispatch = createEventDispatcher<{ edit: Bill }>();

    $: bill = $bills.find(b => b.id === billId) as Bill | undefined;
</script>

{#if bill}
    <div class="flex-1 flex flex-col min-h-0">
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">{bill.name.toUpperCase()}</span>
            <button
                class="bg-transparent border border-[#333] text-[#888] hover:border-[#ff8c00] hover:text-[#ff8c00] cursor-pointer text-xs px-2 py-0.5 transition-colors"
                on:click={() => bill && dispatch('edit', bill)}
            >Edit</button>
        </div>
        <div class="flex-1 overflow-auto p-4">
            <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                    <span class="text-[#555] tracking-wider">NAME</span>
                    <div class="text-[#e0e0e0] mt-1">{bill.name}</div>
                </div>
                <div>
                    <span class="text-[#555] tracking-wider">AMOUNT</span>
                    <div class="font-mono text-lg text-[#ff8c00] mt-1">{formatRupiah(bill.amount)}<span class="text-xs text-[#555]">/mo</span></div>
                </div>
                <div>
                    <span class="text-[#555] tracking-wider">DUE DAY</span>
                    <div class="text-[#e0e0e0] mt-1">{bill.dueDay}<span class="text-[#555]">th of every month</span></div>
                </div>
            </div>
        </div>
    </div>
{/if}
