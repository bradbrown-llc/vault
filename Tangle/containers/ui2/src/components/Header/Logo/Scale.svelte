<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import { scale } from 'svelte/transition';
    import Fill from './Fill.svelte'
    import Outline from './Outline.svelte';
    let innerWidth: number
    let innerHeight: number
    $: tOpts = {
        delay: 2000,
        duration: 1250,
        start: Math.min(10.24,
            Math.min(innerWidth - 40, innerHeight - 32) / 50),
        opacity: 1,
        easing: quartInOut
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight/>

{#if innerWidth !== undefined && innerHeight !== undefined}
    <div transition:scale={tOpts}>
        <Fill/>
        <Outline/>
    </div>
{/if}

<style>
    div {
        display: grid;
        grid-template-rows: 1fr;
        grid-template-columns: 1fr;
    }
</style>