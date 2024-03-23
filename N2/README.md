> ⛔️ **DEPRECATED** -
I've already found a use for N3: mainnets and testnets. More abstractly, groups of groups of chains (which are groups of nodes). I think I'll just call it EVMJS.

# N2
**EIP-1193 and it's consequences have been a disaster for decentralized finance.** Every major web3 and EVM library has insufficient multichain support due to the EIP-1193 standard lacking any consideration for multiple chains. Even on one chain, the EIP-1193 standard limits users, developers, casual traders, and degens alike in that a "Provider" connects to a single blockchain node. Blockchains, by nature, consist of many nodes. So why should everyone be less connected to the blockchain than the nodes that make them? N2 is a lightweight EVM library built with minimal dependencies from the ground up, with a strong focus on multichain and multinode support.

## Why the name 'N2?'
If we think about a node, a single machine running an execution client, we can think of it as having minimal decentralization. A blockchain consists of many nodes working together, with the EVM representing an abstraction of one large machine. So a node is a machine with minimal decentralization, while an EVM is a machine with a layer of decentralization, and consisting of many nodes. 

Take **N** to be a unit of a machine, and number **X** to represent decentralization, with a higher number being more decentralized, and **N0** can represent a node and **N1** can represent an EVM chain. Let's extend this idea one step further. Many of my previous tokens notably existed on many blockchains. Deploying these tokens and managing them has been a perpetual hassle due to my use of the aforemention EIP-1193-corrupted libraries. The ideal EVM library would allow one to interact with **N2**, the layer of decentralization beyond an EVM chain: many EVM chains.

In this understanding, EIP-1193 is a disastrously poorly written standard because it only supports **N0** interactions. This library aims to invalidate EIP-1193 by allowing  **N0**, **N1**, and **N2** interactions.