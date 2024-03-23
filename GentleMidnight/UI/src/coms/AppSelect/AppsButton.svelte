<script>
    import { show, current } from '@/stores/AppSelect.js'
    import Button from '@/coms/common/Button.svelte'
    function onClick() { show.set(true) }
</script>

<Button on:click={onClick}>{$current}</Button>