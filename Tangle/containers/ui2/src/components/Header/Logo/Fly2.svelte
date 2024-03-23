<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import Fly1 from './Fly1.svelte'
    let innerWidth: number
    $: tOpts = {
        delay: 3000,
        duration: 1000,
        x: innerWidth / 2 - /*page leftPad*/20 - /*logo width*/50 / 2,
        opacity: 1,
        easing: quartInOut
    }
</script>

<svelte:window bind:innerWidth/>

{#if innerWidth !== undefined}
    <div transition:fly={tOpts}>
        <Fly1/>
    </div>
{/if}

<style>
    div {
        grid-column-start: 1;
        grid-row-start: 1;
        grid-column-end: 2;
        grid-row-end: 2;
    }
</style>