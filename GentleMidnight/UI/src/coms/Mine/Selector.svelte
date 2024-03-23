<script>
    import { Select, Infos } from './index.js'
    import gtmn from '@/data/gtmn.js'
    let chains = Object.entries(gtmn)
        .sort((a, b) => a[1].name < b[1].name ? -1 : 1)
</script>

<div>
    <Select bind:chains/>
    <Infos bind:chains/>
</div>

<style>
    div {
        display: flex;
        max-height: 100px;
        overflow-y: scroll;
    }
    div::-webkit-scrollbar { display: none; }
</style>