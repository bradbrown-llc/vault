<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import Scale from './Scale.svelte'
    let innerHeight: number
    $: tOpts = {
        delay: 2000,
        duration: 1250,
        y: innerHeight / 2 - /*page leftPad*/16 - /*logo width*/50 / 2,
        opacity: 1,
        easing: quartInOut
    }
</script>

<svelte:window bind:innerHeight/>

{#if innerHeight !== undefined}
    <div transition:fly={tOpts}>
        <Scale/>
    </div>
{/if}