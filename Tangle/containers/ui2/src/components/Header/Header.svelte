<script lang="ts">
    import Logo from './Logo/Fly2.svelte'
    import Tabs from './Tabs.svelte'
    import Hamburger from './Hamburger.svelte'
    let app = 0
</script>

<div>
    <Logo/>
    <Tabs bind:app/>
    <Hamburger bind:app/>
</div>

<style>
    div {
        display: grid;
        grid-template-columns: 50px 1fr 50px;
    }
</style>