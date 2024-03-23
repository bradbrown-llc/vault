<script>
    import { Info } from './index.js'
    export let chains
</script>

<div>
    {#each chains as chain}
        <Info bind:chain/>
    {/each}
</div>