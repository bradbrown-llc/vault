<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import Vector from './Vector.svelte'
    let drawOpts = {
        duration: 2000,
        easing: quartInOut
    }
    let fadeOpts = { duration: 0 }
</script>

<Vector bind:drawOpts bind:fadeOpts --fill="transparent"/>