<script>
    import { show } from '@/stores/AppSelect.js'
    function onClick() { show.set(false) }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={onClick}></div>

<style>
    div {
        position: absolute;
        background-color: black;
        height: 100vh;
        width: 100vw;
        z-index: 1;
        opacity: 0.5;
    }
</style>