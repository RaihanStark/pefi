<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Account } from './stores';

    export let mode: 'create' | 'edit' = 'create';
    export let account: Account | null = null;

    const dispatch = createEventDispatcher<{
        save: { name: string; type: 'bank' | 'debt'; balance: number };
        close: void;
    }>();

    let name = account?.name ?? '';
    let type: 'bank' | 'debt' = account?.type ?? 'bank';
    let balanceStr = account ? Math.abs(account.balance).toString() : '';

    function handleSubmit() {
        const balance = parseInt(balanceStr) || 0;
        dispatch('save', {
            name: name.trim(),
            type,
            balance: type === 'debt' ? -Math.abs(balance) : Math.abs(balance),
        });
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') dispatch('close');
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="bg-[#111] border border-[#333] w-80" on:click|stopPropagation>
        <!-- Header -->
        <div class="flex items-center justify-between bg-[#1a1a1a] px-3 py-1.5 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">
                {mode === 'create' ? 'NEW ACCOUNT' : 'EDIT ACCOUNT'}
            </span>
            <button
                class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                on:click={() => dispatch('close')}
            >✕</button>
        </div>

        <!-- Form -->
        <form class="p-3 flex flex-col gap-3 text-xs" on:submit|preventDefault={handleSubmit}>
            <div class="flex flex-col gap-1">
                <label class="text-[#555] tracking-wider" for="acc-name">NAME</label>
                <input
                    id="acc-name"
                    class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors"
                    type="text"
                    bind:value={name}
                    placeholder="Account name"
                    required
                />
            </div>

            <div class="flex flex-col gap-1">
                <label class="text-[#555] tracking-wider" for="acc-type">TYPE</label>
                <div class="flex gap-2">
                    <button
                        type="button"
                        class="flex-1 px-2 py-1.5 border cursor-pointer transition-colors
                        {type === 'bank' ? 'bg-[#1a2332] border-[#ff8c00] text-[#ff8c00]' : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#555]'}"
                        on:click={() => type = 'bank'}
                    >Bank Account</button>
                    <button
                        type="button"
                        class="flex-1 px-2 py-1.5 border cursor-pointer transition-colors
                        {type === 'debt' ? 'bg-[#1a2332] border-[#ff8c00] text-[#ff8c00]' : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#555]'}"
                        on:click={() => type = 'debt'}
                    >Debt</button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <label class="text-[#555] tracking-wider" for="acc-balance">
                    {type === 'debt' ? 'AMOUNT OWED' : 'BALANCE'}
                </label>
                <div class="flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-[#ff8c00] transition-colors">
                    <span class="text-[#555] pl-2">Rp</span>
                    <input
                        id="acc-balance"
                        class="bg-transparent border-none text-[#e0e0e0] px-2 py-1.5 outline-none flex-1 font-mono"
                        type="number"
                        bind:value={balanceStr}
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 mt-1">
                <button
                    type="button"
                    class="flex-1 bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1.5 cursor-pointer hover:border-[#555] hover:text-[#e0e0e0] transition-colors"
                    on:click={() => dispatch('close')}
                >Cancel</button>
                <button
                    type="submit"
                    class="flex-1 bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-3 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors font-bold"
                    disabled={!name.trim()}
                >Save</button>
            </div>
        </form>
    </div>
</div>
