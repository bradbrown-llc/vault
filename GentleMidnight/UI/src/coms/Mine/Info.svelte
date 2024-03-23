<script>
    import { Status, Block, Interval, Open, Closed } from './index.js'
    export let chain
</script>

<div>
    <Status bind:chain/>
    <Open bind:chain/>
    <Block bind:chain/>
    <Closed bind:chain/>
    <Interval bind:chain/>
</div>

<style>
    div {
        position: relative;
        display: grid;
        width: calc(280px - 70px);
        height: calc(40px);
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 0 1mm;
        border-bottom: 1px solid #3F00FF;
    }
    div:last-of-type { border: none; }
    @media (prefers-color-scheme: dark) {
        div { border-bottom: 1px solid #F6F1D5; }
    }
</style>