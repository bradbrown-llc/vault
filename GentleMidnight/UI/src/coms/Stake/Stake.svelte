<script>
    import { Web3Input } from '@/coms/common'
    import { onMount, onDestroy } from 'svelte'
    import { medium } from '@/medium'
    let value, chainId, app = 'stake'
    $: console.log(value)
    onMount(() => {
        chainId = ethereum.chainId
        medium.watch({ app, chainId })
        ethereum.on('chainChanged', onChainChanged)
    })
    onDestroy(() => {
        medium.unwatch({ app, chainId })
        ethereum.removeListener('chainChanged', onChainChanged)
    })
    function onChainChanged() {
        medium.unwatch({ app, chainId })
        chainId = ethereum.chainId
        medium.watch({ app, chainId })
    }
</script>

<Web3Input bind:value decimals={6} max={100000000000n}/>