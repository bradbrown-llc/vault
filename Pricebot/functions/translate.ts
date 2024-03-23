export function translate(network) {
    switch (network) {
    case 'eth': return 'ETH  '
    case 'bsc': return 'BSC  '
    case 'fantom': return 'FTM  '
    case 'avalanche': return 'AVAX '
    case 'arbitrum': return 'ARB  '
    default: return ''
    }
}