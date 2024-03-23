<script>
    import { show, current } from '@/stores/AppSelect.js'
    import Mask from './Mask.svelte'
    import apps from '@/data/apps.js'
    import Button from '@/coms/common/Button.svelte'
    function onClick(app) {
        current.set(app)
        show.set(false)
    }
</script>

{#if $show}
    <Mask/>
    <div>
        {#each apps.filter(app => app !== $current) as app}
            <Button
                on:click={() => onClick(app)}>
                {app}
            </Button>
        {/each}
    </div>
{/if}

<style>
    div {
        position: absolute;
        z-index: 2;
        width: 100vw;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 5mm;
        top: calc(13mm + 0.5rem + 5mm);
    }
</style>