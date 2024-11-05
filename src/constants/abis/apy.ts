export const ApyABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_USD",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_LBRE",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_factory",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "_chef",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_pid",
				"type": "uint8"
			}
		],
		"name": "APYC",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "lpOutput",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rewardPerBlock",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "chef",
		"outputs": [
			{
				"internalType": "contract MasterChefV2",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "factory",
		"outputs": [
			{
				"internalType": "contract IUniswapFactory",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "LBRE",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "input",
				"type": "uint256"
			}
		],
		"name": "LbreToUSD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_lp",
				"type": "address"
			}
		],
		"name": "LPtoUSD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USD",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token0",
				"type": "address"
			}
		],
		"name": "USDToToken0",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]