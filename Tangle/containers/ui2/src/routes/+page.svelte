<script lang="ts">
    import Header from '../components/Header/Header.svelte'
</script>

<div>
    <Header/>
</div>

<style>
    div {
        padding: 16px 20px;
        display: grid;
        grid-template-rows: 50px 1fr 50px;
        min-height: 100%;
    }
</style>
