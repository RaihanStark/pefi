<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {
        expenseCategories,
        incomeCategories,
        addCategory,
        renameCategory,
        deleteCategory,
    } from './stores';

    const dispatch = createEventDispatcher<{ close: void }>();

    // Settings nav
    let activeSection = 'categories';

    // Category tab
    let activeTab: 'expense' | 'income' = 'expense';

    // Inline editing
    let editingIdx: number | null = null;
    let editingValue = '';

    // New category
    let newName = '';

    function startEdit(idx: number, name: string) {
        editingIdx = idx;
        editingValue = name;
    }

    function saveEdit(oldName: string) {
        if (editingValue.trim() && editingValue.trim() !== oldName) {
            renameCategory(activeTab, oldName, editingValue.trim());
        }
        editingIdx = null;
        editingValue = '';
    }

    function cancelEdit() {
        editingIdx = null;
        editingValue = '';
    }

    function handleAdd() {
        if (!newName.trim()) return;
        addCategory(activeTab, newName.trim());
        newName = '';
    }

    function handleDelete(name: string) {
        deleteCategory(activeTab, name);
        if (editingIdx !== null) cancelEdit();
    }

    $: categories = activeTab === 'expense' ? $expenseCategories : $incomeCategories;

    const sections = [
        { key: 'categories', label: 'CATEGORIES' },
    ];
</script>

<div class="flex-1 flex min-w-0">
    <!-- Settings sidebar -->
    <div class="w-48 bg-[#111] border-r border-[#222] flex flex-col shrink-0">
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">SETTINGS</span>
            <button
                class="bg-transparent border-none text-[#555] hover:text-[#e0e0e0] cursor-pointer text-xs transition-colors"
                on:click={() => dispatch('close')}
            >← Back</button>
        </div>
        <div class="flex-1 overflow-y-auto">
            {#each sections as section}
                <button
                    class="w-full text-left border-none cursor-pointer px-3 py-1.5 text-xs tracking-wider transition-colors
                    {activeSection === section.key ? 'bg-[#1a2332] text-[#ff8c00] border-l-2 border-l-[#ff8c00]' : 'bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-[#e0e0e0] border-l-2 border-l-transparent'}"
                    on:click={() => { activeSection = section.key; cancelEdit(); }}
                >{section.label}</button>
            {/each}
        </div>
    </div>

    <!-- Settings content -->
    <div class="flex-1 flex flex-col min-w-0">
        {#if activeSection === 'categories'}
            <!-- Category tabs -->
            <div class="flex border-b border-[#222] bg-[#111]">
                <button
                    class="px-4 py-1.5 text-xs tracking-wider border-none cursor-pointer transition-colors
                    {activeTab === 'expense' ? 'bg-[#1a1a1a] text-[#ff8c00] border-b-2 border-b-[#ff8c00]' : 'bg-transparent text-[#888] hover:text-[#e0e0e0]'}"
                    on:click={() => { activeTab = 'expense'; cancelEdit(); }}
                >EXPENSE</button>
                <button
                    class="px-4 py-1.5 text-xs tracking-wider border-none cursor-pointer transition-colors
                    {activeTab === 'income' ? 'bg-[#1a1a1a] text-[#ff8c00] border-b-2 border-b-[#ff8c00]' : 'bg-transparent text-[#888] hover:text-[#e0e0e0]'}"
                    on:click={() => { activeTab = 'income'; cancelEdit(); }}
                >INCOME</button>
            </div>

            <!-- Category list -->
            <div class="flex-1 overflow-y-auto">
                {#each categories as cat, i}
                    <div class="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] text-xs hover:bg-[#111] group">
                        {#if editingIdx === i}
                            <form class="flex items-center gap-2 flex-1" on:submit|preventDefault={() => saveEdit(cat)}>
                                <input
                                    class="bg-[#1a1a1a] border border-[#ff8c00] text-[#e0e0e0] px-2 py-1 outline-none flex-1"
                                    type="text"
                                    bind:value={editingValue}
                                    autofocus
                                />
                                <button type="submit" class="bg-transparent border-none text-[#33cc33] cursor-pointer hover:text-[#55ee55] transition-colors">Save</button>
                                <button type="button" class="bg-transparent border-none text-[#888] cursor-pointer hover:text-[#e0e0e0] transition-colors" on:click={cancelEdit}>Cancel</button>
                            </form>
                        {:else}
                            <span class="text-[#e0e0e0]">{cat}</span>
                            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    class="bg-transparent border-none text-[#888] cursor-pointer hover:text-[#ff8c00] transition-colors"
                                    on:click={() => startEdit(i, cat)}
                                >Rename</button>
                                <button
                                    class="bg-transparent border-none text-[#888] cursor-pointer hover:text-[#cc3333] transition-colors"
                                    on:click={() => handleDelete(cat)}
                                >Delete</button>
                            </div>
                        {/if}
                    </div>
                {/each}
                {#if categories.length === 0}
                    <div class="px-3 py-4 text-center text-[#555] text-xs">No categories</div>
                {/if}
            </div>

            <!-- Add new -->
            <form class="flex items-center gap-2 px-3 py-2 border-t border-[#222]" on:submit|preventDefault={handleAdd}>
                <input
                    class="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none flex-1 text-xs focus:border-[#ff8c00] transition-colors"
                    type="text"
                    bind:value={newName}
                    placeholder="New category name..."
                />
                <button
                    type="submit"
                    class="bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-3 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors text-xs font-bold"
                    disabled={!newName.trim()}
                >Add</button>
            </form>
        {/if}
    </div>
</div>
