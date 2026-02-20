<script lang="ts">
    import { onMount } from 'svelte';
    import Sidebar from './lib/Sidebar.svelte';
    import Timeline from './lib/Timeline.svelte';
    import DebtDetail from './lib/DebtDetail.svelte';
    import AccountModal from './lib/AccountModal.svelte';
    import DebtModal from './lib/DebtModal.svelte';
    import Settings from './lib/Settings.svelte';
    import { accounts, debts, debtRemaining, addAccount, addDebt, updateAccount, deleteAccount, deleteDebt, loadAccounts, loadDebts, loadCategories, formatRupiah } from './lib/stores';
    import type { Account } from './lib/stores';

    let activeView: 'transactions' | 'debts' = 'transactions';
    let selectedItem = '';
    let selectedId: number = 0;

    // Modal state
    let showModal = false;
    let modalMode: 'create' | 'edit' = 'create';
    let editingAccount: Account | null = null;

    // Debt modal
    let showDebtModal = false;

    // Confirm delete
    let showDeleteConfirm = false;
    let deleteTargetId: number = 0;
    let deleteTargetName = '';

    // Settings
    let showSettings = false;

    // Rename
    let showRename = false;
    let renameId: number = 0;
    let renameName = '';

    onMount(async () => {
        await Promise.all([loadAccounts(), loadDebts(), loadCategories()]);
    });

    function handleSelect(e: CustomEvent<{ section: string; item: string; id: number }>) {
        selectedItem = e.detail.item;
        selectedId = e.detail.id;
        activeView = e.detail.section === 'Debts' ? 'debts' : 'transactions';
    }

    function openCreate() {
        modalMode = 'create';
        editingAccount = null;
        showModal = true;
    }

    function openEdit() {
        if (!selectedId) return;
        const acc = $accounts.find(a => a.id === selectedId);
        if (!acc) return;
        modalMode = 'edit';
        editingAccount = acc;
        showModal = true;
    }

    async function handleSave(e: CustomEvent<{ name: string; type: 'bank' | 'debt'; balance: number }>) {
        const { name, type, balance } = e.detail;
        if (modalMode === 'create') {
            await addAccount(name, type, balance);
        } else if (editingAccount) {
            await updateAccount(editingAccount.id, { name, type, balance });
        }
        showModal = false;
        editingAccount = null;
    }

    async function handleDebtSave(e: CustomEvent<{ name: string }>) {
        const id = await addDebt(e.detail.name);
        selectedId = id;
        selectedItem = e.detail.name;
        activeView = 'debts';
        showDebtModal = false;
    }

    let deleteTargetSection = '';

    function handleContextDelete(e: CustomEvent<{ id: number; name: string; section: string }>) {
        deleteTargetId = e.detail.id;
        deleteTargetName = e.detail.name;
        deleteTargetSection = e.detail.section;
        showDeleteConfirm = true;
    }

    async function doDelete() {
        if (deleteTargetSection === 'Debts') {
            await deleteDebt(deleteTargetId);
        } else {
            await deleteAccount(deleteTargetId);
        }
        if (selectedId === deleteTargetId) {
            selectedId = 0;
            selectedItem = '';
            activeView = 'transactions';
        }
        showDeleteConfirm = false;
    }

    function handleContextRename(e: CustomEvent<{ id: number; name: string }>) {
        renameId = e.detail.id;
        renameName = e.detail.name;
        showRename = true;
    }

    async function doRename() {
        if (renameName.trim()) {
            await updateAccount(renameId, { name: renameName.trim() });
            if (selectedId === renameId) selectedItem = renameName.trim();
        }
        showRename = false;
    }

    $: totalBalance = $accounts.filter(a => a.type === 'bank').reduce((s, a) => s + a.balance, 0);
    $: totalDebt = $debts.reduce((s, d) => s + debtRemaining(d), 0);
    $: net = totalBalance - totalDebt;
    $: acctCount = $accounts.length;
</script>

<div class="flex flex-col h-full text-[#e0e0e0]">
    {#if showSettings}
        <div class="flex flex-1 min-h-0">
            <Settings on:close={() => showSettings = false} />
        </div>
    {:else}
        <div class="flex flex-1 min-h-0">
            <Sidebar on:select={handleSelect} on:addAccount={openCreate} on:addDebt={() => showDebtModal = true} on:rename={handleContextRename} on:delete={handleContextDelete} on:settings={() => showSettings = true} bind:selectedId />
            {#if activeView === 'debts' && selectedId}
                <DebtDetail debtId={selectedId} />
            {:else if selectedId}
                <Timeline accountId={selectedId} accountName={selectedItem} />
            {:else}
                <div class="flex-1 flex items-center justify-center text-[#555] text-xs">Select an account</div>
            {/if}
        </div>
    {/if}

    <!-- Status Bar -->
    <div class="flex bg-[#111] border-t border-[#222] text-xs">
        <div class="px-3 py-1 border-r border-[#222] text-[#888]">ACCT <span class="text-[#e0e0e0]">{acctCount}</span></div>
        <div class="px-3 py-1 border-r border-[#222] text-[#888]">BAL <span class="text-[#33cc33]">{formatRupiah(totalBalance)}</span></div>
        <div class="px-3 py-1 border-r border-[#222] text-[#888]">DEBT <span class="text-[#cc3333]">{formatRupiah(Math.abs(totalDebt))}</span></div>
        <div class="px-3 py-1 text-[#888]">NET <span class="{net < 0 ? 'text-[#cc3333]' : 'text-[#33cc33]'} font-bold">{formatRupiah(net)}</span></div>
        <div class="ml-auto px-3 py-1 text-[#555]">v1.0</div>
    </div>
</div>

<!-- Account Modal -->
{#if showModal}
    <AccountModal
        mode={modalMode}
        account={editingAccount}
        on:save={handleSave}
        on:close={() => { showModal = false; editingAccount = null; }}
    />
{/if}

<!-- Debt Modal -->
{#if showDebtModal}
    <DebtModal
        on:save={handleDebtSave}
        on:close={() => showDebtModal = false}
    />
{/if}

<!-- Delete Confirmation -->
{#if showDeleteConfirm}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" on:click={() => showDeleteConfirm = false}>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div class="bg-[#111] border border-[#333] w-72" on:click|stopPropagation>
            <div class="bg-[#1a1a1a] px-3 py-1.5 border-b border-[#222]">
                <span class="text-[#cc3333] font-bold text-xs tracking-wider">DELETE {deleteTargetSection === 'Debts' ? 'DEBT' : 'ACCOUNT'}</span>
            </div>
            <div class="p-3 text-xs">
                <p class="text-[#e0e0e0] mb-3">Delete <span class="text-[#ff8c00] font-bold">{deleteTargetName}</span>? This cannot be undone.</p>
                <div class="flex gap-2">
                    <button
                        class="flex-1 bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1.5 cursor-pointer hover:border-[#555] hover:text-[#e0e0e0] transition-colors"
                        on:click={() => showDeleteConfirm = false}
                    >Cancel</button>
                    <button
                        class="flex-1 bg-[#2a1515] border border-[#cc3333] text-[#cc3333] px-3 py-1.5 cursor-pointer hover:bg-[#cc3333] hover:text-black transition-colors font-bold"
                        on:click={doDelete}
                    >Delete</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Rename Modal -->
{#if showRename}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" on:click={() => showRename = false}>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div class="bg-[#111] border border-[#333] w-72" on:click|stopPropagation>
            <div class="bg-[#1a1a1a] px-3 py-1.5 border-b border-[#222]">
                <span class="text-[#ff8c00] font-bold text-xs tracking-wider">RENAME ACCOUNT</span>
            </div>
            <form class="p-3 text-xs" on:submit|preventDefault={doRename}>
                <input
                    class="w-full bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] px-2 py-1.5 outline-none focus:border-[#ff8c00] transition-colors mb-3"
                    type="text"
                    bind:value={renameName}
                    autofocus
                />
                <div class="flex gap-2">
                    <button
                        type="button"
                        class="flex-1 bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1.5 cursor-pointer hover:border-[#555] hover:text-[#e0e0e0] transition-colors"
                        on:click={() => showRename = false}
                    >Cancel</button>
                    <button
                        type="submit"
                        class="flex-1 bg-[#1a2332] border border-[#ff8c00] text-[#ff8c00] px-3 py-1.5 cursor-pointer hover:bg-[#ff8c00] hover:text-black transition-colors font-bold"
                        disabled={!renameName.trim()}
                    >Rename</button>
                </div>
            </form>
        </div>
    </div>
{/if}
