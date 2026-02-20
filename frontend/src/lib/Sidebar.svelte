<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { bankAccounts, debtAccounts, formatRupiah } from './stores';

    const dispatch = createEventDispatcher<{
        select: { section: string; item: string; id: string };
        add: void;
        rename: { id: string; name: string };
        delete: { id: string; name: string };
        settings: void;
    }>();

    let sections = [
        { key: 'Bank Accounts', open: true },
        { key: 'Debts', open: true },
    ];

    export let selectedId = '';

    let width = 280;
    let isResizing = false;

    // Context menu state
    let contextMenu: { x: number; y: number; id: string; name: string } | null = null;

    function openContext(e: MouseEvent, id: string, name: string) {
        e.preventDefault();
        contextMenu = { x: e.clientX, y: e.clientY, id, name };
    }

    function closeContext() {
        contextMenu = null;
    }

    function handleRename() {
        if (!contextMenu) return;
        dispatch('rename', { id: contextMenu.id, name: contextMenu.name });
        contextMenu = null;
    }

    function handleDelete() {
        if (!contextMenu) return;
        dispatch('delete', { id: contextMenu.id, name: contextMenu.name });
        contextMenu = null;
    }

    function startResize(e: MouseEvent) {
        isResizing = true;
        const startX = e.clientX;
        const startWidth = width;

        function onMouseMove(e: MouseEvent) {
            const newWidth = startWidth + (e.clientX - startX);
            width = Math.max(200, Math.min(500, newWidth));
        }

        function onMouseUp() {
            isResizing = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    function getItems(key: string) {
        if (key === 'Bank Accounts') return $bankAccounts;
        if (key === 'Debts') return $debtAccounts;
        return [];
    }
</script>

<svelte:window on:click={closeContext} />

<div class="bg-[#111] flex shrink-0 relative" style="width: {width}px">
    <div class="flex flex-col flex-1 min-w-0 border-r border-[#222]">
        <div class="bg-[#1a1a1a] flex items-center justify-between px-3 py-1 border-b border-[#222]">
            <span class="text-[#ff8c00] font-bold text-xs tracking-wider">ACCOUNTS</span>
            <button
                class="bg-transparent border-none text-[#555] hover:text-[#ff8c00] cursor-pointer text-sm leading-none transition-colors"
                on:click={() => dispatch('add')}
            >+</button>
        </div>
        <div class="flex-1 overflow-y-auto">
            {#each sections as section, si}
                <button
                    class="flex items-center gap-1.5 w-full text-left bg-transparent border-none cursor-pointer font-bold py-1 px-3 text-[#888] hover:text-[#ff8c00] transition-colors text-xs tracking-wide border-b border-[#1a1a1a]"
                    on:click={() => sections[si].open = !sections[si].open}
                >
                    <span class="text-[10px] text-[#555]">{section.open ? '▼' : '▶'}</span>
                    {section.key.toUpperCase()}
                </button>
                {#if section.open}
                    {#each getItems(section.key) as item}
                        <button
                            class="flex items-center justify-between w-full text-left border-none cursor-pointer py-1 pl-6 pr-3 transition-colors text-xs
                            {selectedId === item.id ? 'bg-[#1a2332] text-[#ff8c00] border-l-2 border-l-[#ff8c00]' : 'bg-transparent hover:bg-[#1a1a1a] text-[#ccc] border-l-2 border-l-transparent'}"
                            on:click={() => { selectedId = item.id; dispatch('select', { section: section.key, item: item.name, id: item.id }); }}
                            on:contextmenu={(e) => openContext(e, item.id, item.name)}
                        >
                            <span>{item.name}</span>
                            <span class="font-mono {item.balance < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'}">{formatRupiah(item.balance)}</span>
                        </button>
                    {/each}
                {/if}
            {/each}
        </div>
        <!-- Settings button -->
        <div class="border-t border-[#222] px-3 py-1.5">
            <button
                class="w-full text-left bg-transparent border-none text-[#555] hover:text-[#ff8c00] cursor-pointer text-xs transition-colors tracking-wider"
                on:click={() => dispatch('settings')}
            >⚙ SETTINGS</button>
        </div>
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#ff8c00] transition-colors {isResizing ? 'bg-[#ff8c00]' : ''}"
        on:mousedown={startResize}
    ></div>
</div>

<!-- Context menu -->
{#if contextMenu}
    <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
    <div
        class="fixed z-50 bg-[#1a1a1a] border border-[#333] py-0.5 min-w-[120px]"
        style="left: {contextMenu.x}px; top: {contextMenu.y}px"
        on:click|stopPropagation
    >
        <button
            class="w-full text-left px-3 py-1 text-xs text-[#e0e0e0] bg-transparent border-none cursor-pointer hover:bg-[#1a2332] hover:text-[#ff8c00] transition-colors"
            on:click={handleRename}
        >Rename</button>
        <div class="h-px bg-[#333] mx-1"></div>
        <button
            class="w-full text-left px-3 py-1 text-xs text-[#cc3333] bg-transparent border-none cursor-pointer hover:bg-[#2a1515] transition-colors"
            on:click={handleDelete}
        >Delete</button>
    </div>
{/if}
