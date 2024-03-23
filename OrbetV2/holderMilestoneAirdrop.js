let fs = require("fs");

let tokenHoldersArray = [];
let liqHoldersArray = [];
let tokenHoldersCSV = "export-tokenholders-for-contract-0x2de27d3432d3188b53b02137e07b47896d347d45.csv";
let liqHoldersCSV = "export-tokenholders-for-contract-0xdc6A5FAF34AfFCCc6a00D580ecB3308fC1848F22.csv";
let winners = [];

let getHolders = arg0 => {
	let fileToRead = arg0 == 0 ? tokenHoldersCSV : liqHoldersCSV;
	let data = fs.readFileSync(fileToRead, "utf8");
	let dataArray = data.split('\n');
	dataArray = dataArray.slice(1, dataArray.length - 1);
	dataArray.forEach(holder => {
		let holderAddress = holder.split(',')[0].replace(/"/g, '');
		let holderAmount = holder.split(',')[1].replace(/"/g, '');
		let isHolderAddressForbidden = false;
		let forbiddenAddresses = [
			"0xD8d2c7Bb229Eda3F086c687Cf3B89f42847C4Bb5", 	// an actual psycho
			"0xe1a811bdfb656dc47a7262dbde31071d9a916b1a", 	// the dev
			"0xdc6a5faf34affccc6a00d580ecb3308fc1848f22", 	// uniswap (ETH-ORBIv2)
			"0xdab7e3ee355cd306cb806db6cce0c157e1d300bd", 	// uniswap (AZIZv2-ORBIv2)
			"0xc50e9008b0a7de244db3d45f98c7463321ea9838", 	// uniswap (ARSUv2 - ORBIv2)
			"0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214", 	// unicrypt
			"0x0000000000000000000000000000000000000000", 	// 0-address
			"0x3f049e5850229d18f01460dfda38c3ea6422b5a4"	// by request
		];
		forbiddenAddresses.forEach(forbiddenAddress => {
			if (holderAddress == forbiddenAddress) isHolderAddressForbidden = true;
		});
		if (!isHolderAddressForbidden && arg0 == 0 && holderAmount >= 50000) tokenHoldersArray.push(holderAddress);
		if (!isHolderAddressForbidden && arg0 == 1 && holderAmount >= 0.001) liqHoldersArray.push(holderAddress);
	});
}

getHolders(0);
getHolders(1);

let winnerCount = 4;
for (let i = 0; i < winnerCount; i++) {
	let chanceForLiqHolder = liqHoldersArray.length > 0 ? 2 / 3 : 0;
	let chanceForTokenHolder = 1 - chanceForLiqHolder;
	let whichList = Math.random() <= chanceForTokenHolder ? 0 : 1;
	let winnerAddress = [tokenHoldersArray, liqHoldersArray][whichList][parseInt(Math.random() * ([tokenHoldersArray, liqHoldersArray][whichList].length))];
	winners.push(winnerAddress);
	[tokenHoldersArray, liqHoldersArray][whichList].splice([tokenHoldersArray, liqHoldersArray][whichList].indexOf(winnerAddress), 1);
}

console.log(winners);