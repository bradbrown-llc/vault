<script>
    import { Option } from './index.js'
    import { medium } from '@/medium'
    export let chains
    let app = 'mine'
    let value = []
    let prevValue = []
    function onChange() {
        let watch = value.filter(chain => !prevValue.includes(chain))
        let unwatch = prevValue.filter(chain => !value.includes(chain))
        for (let chainId of watch) medium.watch({ app, chainId })
        for (let chainId of unwatch) medium.unwatch({ app, chainId })
        prevValue = [...value]
    }
</script>

<select multiple bind:value on:change={onChange}>
    {#each chains as chain}
        <Option value={chain[0]}>
            {chain[1].name}
        </Option>
    {/each}
</select>

<style>
    select {
        border: none;
        outline: none;
        overflow: visible;
    }
</style>