<script lang="ts">
    import Tab, { Label } from '@smui/tab'
    import TabBar from '@smui/tab-bar'
    import { fade } from 'svelte/transition'
    import { Apps } from '../../enums/Apps.mjs'
    export let app: number
    $: active = Apps[app]
    let names = Object.keys(Apps).filter(key => isNaN(Number(key)))
    let _ = false
    setTimeout(() => _ = true)
</script>

{#if _}
    <div transition:fade={{ duration: 250, delay: 3500 }}>
        <TabBar tabs={names} let:tab bind:active>
            <Tab {tab} on:click={() => app = Apps[tab]}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div>
{/if}

<style>
    div {
        grid-row-start: 1;
        grid-column-start: 2;
        padding: 0 20px;
        max-width: calc(100vw - 20px - 50px - 20px - 20px - 50px - 20px);
    }
</style>