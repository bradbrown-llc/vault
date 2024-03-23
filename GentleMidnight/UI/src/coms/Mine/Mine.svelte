<script>
    import { Selector } from './index.js'
    // import { medium } from '@/medium'
    // import gtmn from '@/data/gtmn.js'
    // let app = 'mine'
    // let chains = Object.entries(gtmn)
    //     .sort((a, b) => a[1].name < b[1].name ? -1 : 1)
    // let value = []
    // let prevValue = []
    // function onChange() {
    //     let watch = value.filter(chain => !prevValue.includes(chain))
    //     let unwatch = prevValue.filter(chain => !value.includes(chain))
    //     for (let chainId of watch) medium.watch({ app, chainId })
    //     for (let chainId of unwatch) medium.unwatch({ app, chainId })
    //     prevValue = [...value]
    // }
</script>

<Selector/>

<!-- <div class="foo">
    <select multiple bind:value on:change={onChange}>
        {#each chains as chain}
            <option value={chain[0]}>
                {chain[1].name}
            </option>
        {/each}
    </select>
    <div class="baz">
        {#each chains as chain, i}
            <div class="bar">
                <div class="faz">block</div>
                <div class="boo">28911930</div>
                <div class="faz">int</div>
                <div class="boo">5000</div>
                <div class="faz">open</div>
                <div class="boo">5</div>
                <div class="faz">exc</div>
                <div class="boo">1</div>
            </div>
        {/each}
    </div>
</div>

<style>
    .boo {
        color: #3F00FF;
        font-size: 80%;
        font-weight: 600;
        font-family: monospace;
        display: flex;
        justify-content: left;
        align-items: center;
    }
</style> -->