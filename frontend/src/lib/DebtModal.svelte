<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        save: { name: string };
        close: void;
    }>();

    let name = '';

    function handleSubmit() {
        dispatch('save', { name: name.trim() });
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') dispatch('close');
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" on:click={() => dispatch('close')}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="bg-[#111] border border-[#333] w-72" on:click|stopPropagation>
        <div class="flex items-center justify-between bg-[#1a1a1a] px-3 py-1.5 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">NEW DEBT</span>
            <button
                class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-sm transition-colors"
                on:click={() => dispatch('close')}
            >✕</button>
        </div>
        <form class="p-3 flex flex-col gap-3 text-xs" on:submit|preventDefault={handleSubmit}>
            <div class="flex flex-col gap-1">
                <label class="text-[#555] tracking-wider" for="debt-name">NAME</label>
                <input
                    id="debt-name"
                    class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors"
                    type="text"
                    bind:value={name}
                    placeholder="Debtor name"
                    required
                />
            </div>
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
                >Create</button>
            </div>
        </form>
    </div>
</div>
