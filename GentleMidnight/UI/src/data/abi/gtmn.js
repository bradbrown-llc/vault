export let abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"int256","name":"delta","type":"int256"}],"name":"AdjustStake","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"airdropper","type":"address"},{"indexed":false,"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"Airdrop","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"claimer","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"Claim","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"executor","type":"address"},{"components":[{"components":[{"components":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"gas","type":"uint256"},{"internalType":"uint256","name":"work","type":"uint256"},{"internalType":"uint256","name":"source","type":"uint256"},{"internalType":"uint256","name":"dest","type":"uint256"},{"internalType":"uint256","name":"input","type":"uint256"},{"internalType":"uint256","name":"output","type":"uint256"},{"internalType":"uint256","name":"id","type":"uint256"}],"internalType":"struct Req","name":"req","type":"tuple"},{"components":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"subtree","type":"uint256"}],"internalType":"struct Proof","name":"proof","type":"tuple"},{"internalType":"uint256","name":"subtrahend","type":"uint256"},{"internalType":"uint256","name":"newOutput","type":"uint256"}],"internalType":"struct Input[]","name":"inputs","type":"tuple[]"},{"components":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"internalType":"struct Output[]","name":"outputs","type":"tuple[]"},{"internalType":"uint256","name":"chain","type":"uint256"}],"indexed":false,"internalType":"struct Stream[]","name":"stream","type":"tuple[]"},{"components":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"address","name":"worker","type":"address"},{"internalType":"uint256","name":"n","type":"uint256"}],"indexed":false,"internalType":"struct Work[]","name":"works","type":"tuple[]"},{"components":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"subtree","type":"uint256"}],"indexed":false,"internalType":"struct Proof[]","name":"proofs","type":"tuple[]"}],"name":"Execute","type":"event"},{"anonymous":false,"inputs":[{"components":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"gas","type":"uint256"},{"internalType":"uint256","name":"work","type":"uint256"},{"internalType":"uint256","name":"source","type":"uint256"},{"internalType":"uint256","name":"dest","type":"uint256"},{"internalType":"uint256","name":"input","type":"uint256"},{"internalType":"uint256","name":"output","type":"uint256"},{"internalType":"uint256","name":"id","type":"uint256"}],"indexed":false,"internalType":"struct Req","name":"req","type":"tuple"}],"name":"NewReq","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"ADISARoots","outputs":[{"internalType":"bytes32[]","name":"roots","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum FarmID","name":"","type":"uint8"},{"internalType":"address","name":"","type":"address"}],"name":"accs","outputs":[{"internalType":"uint256","name":"reward","type":"uint256"},{"internalType":"uint256","name":"points","type":"uint256"},{"internalType":"uint256","name":"sigma","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"adisa","outputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"delta","type":"int256"}],"name":"adjustStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"airdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"airdropAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"guy","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"available","outputs":[{"internalType":"uint256[]","name":"avails","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"chunks","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"components":[{"components":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"gas","type":"uint256"},{"internalType":"uint256","name":"work","type":"uint256"},{"internalType":"uint256","name":"source","type":"uint256"},{"internalType":"uint256","name":"dest","type":"uint256"},{"internalType":"uint256","name":"input","type":"uint256"},{"internalType":"uint256","name":"output","type":"uint256"},{"internalType":"uint256","name":"id","type":"uint256"}],"internalType":"struct Req","name":"req","type":"tuple"},{"components":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"subtree","type":"uint256"}],"internalType":"struct Proof","name":"proof","type":"tuple"},{"internalType":"uint256","name":"subtrahend","type":"uint256"},{"internalType":"uint256","name":"newOutput","type":"uint256"}],"internalType":"struct Input[]","name":"inputs","type":"tuple[]"},{"components":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"internalType":"struct Output[]","name":"outputs","type":"tuple[]"},{"internalType":"uint256","name":"chain","type":"uint256"}],"internalType":"struct Stream[]","name":"streams","type":"tuple[]"},{"components":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"address","name":"worker","type":"address"},{"internalType":"uint256","name":"n","type":"uint256"}],"internalType":"struct Work[]","name":"works","type":"tuple[]"},{"components":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"subtree","type":"uint256"}],"internalType":"struct Proof[]","name":"proofs","type":"tuple[]"}],"name":"execute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum FarmID","name":"","type":"uint8"}],"name":"farms","outputs":[{"components":[{"internalType":"uint256","name":"maxValue","type":"uint256"},{"internalType":"uint256","name":"timeScaler","type":"uint256"},{"internalType":"uint256","name":"reward","type":"uint256"},{"internalType":"uint256","name":"t1","type":"uint256"},{"internalType":"uint256","name":"t2","type":"uint256"},{"internalType":"uint256","name":"valueScaler","type":"uint256"}],"internalType":"struct Gen","name":"gen","type":"tuple"},{"internalType":"uint256","name":"sigma","type":"uint256"},{"internalType":"uint256","name":"points","type":"uint256"},{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"genPayment","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityPool","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minBal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"payGens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newLiquidityPool","type":"address"}],"name":"setLiquidityPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"gas","type":"uint256"},{"internalType":"uint256","name":"work","type":"uint256"},{"internalType":"uint256","name":"dest","type":"uint256"},{"internalType":"uint256","name":"input","type":"uint256"},{"internalType":"uint256","name":"output","type":"uint256"}],"internalType":"struct Subreq[]","name":"subreqs","type":"tuple[]"}],"name":"trade","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"guys","type":"address[]"}],"name":"updateHoldAcc","outputs":[],"stateMutability":"nonpayable","type":"function"}]