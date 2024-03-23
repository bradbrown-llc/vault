<script lang="ts">
    import IconButton from '@smui/icon-button'
    import Menu from '@smui/menu'
    import List, { Item, Text } from '@smui/list'
    import { fade } from 'svelte/transition'
    import { Apps } from '../../enums/Apps.mjs'
    export let app: number
    let menu: Menu
    let names = Object.keys(Apps).filter(key => isNaN(Number(key))).sort()
    let _ = false
    setTimeout(() => _ = true)
</script>

{#if _}
    <div transition:fade={{ duration: 250, delay: 3500 }}>
        <IconButton
            class="material-icons"
            on:click={() => menu.setOpen(true)}
        >
            menu
        </IconButton>
        <Menu bind:this={menu}>
            <List>
                {#each names as name (name)}
                    <Item on:SMUI:action={() => app = Apps[name]}>
                        <Text>{name}</Text>
                    </Item>
                {/each}
            </List>
        </Menu>
    </div>
{/if}

<style>
    div {
        grid-row-start: 1;
        grid-column-start: 3;
    }
</style>