<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import Vector from './Vector.svelte'
    let drawOpts = { duration: 0 }
    let fadeOpts = {
        duration: 2000,
        delay: 1000,
        easing: quartInOut
    }
</script>

<Vector bind:drawOpts bind:fadeOpts --strokeWidth="0"/>