
// Import web3 library
import Web3 from 'web3';
import { abiJSON } from './contractABI'


export async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAddress = accounts[0];
           


            const networkId = await ethereum.request({ method: 'net_version' });
            if (networkId !== '11155111') { // Check if the network ID is not Sepolia's (11155111)
                try {
                    // Switch to Sepolia Testnet
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x6B0F', // Sepolia Testnet chain ID
                                chainName: 'Sepolia Testnet',
                                rpcUrls: ['https://rpc.sepolia.org'], // Replace with actual RPC URL
                                blockExplorerUrls: ['https://sepolia.etherscan.io/'], // Replace with actual block explorer URL
                                nativeCurrency: {
                                    name: 'SepoliaETH',
                                    symbol: 'SETH',
                                    decimals: 18,
                                },
                            },
                        ],
                    });


                } catch (error) {
                    console.error('Error adding chain:', error);
                    return userAddress
                }
            }
            return userAddress
        } catch (error) {
            console.error(error);
        }
    }
};
export async function fetchNFTS(userAddress) {
    // Make an API request to the backend to fetch NFTs
    const url = 'https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/get-user-nfts';
    const queryParams = new URLSearchParams({ userAddress: userAddress });
    const fullUrl = `${url}?${queryParams}`;

    try {
        const response = await fetch(fullUrl);
        if (response.ok) {
            const responseData = await response.json();
            
            const nftData = responseData;
         
            return nftData;

        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Could not query adress NFTs:', error);
        return 500
    }

}



// Define contract address, ABI and minting function

const contractAddress = '0xc3dd7ea90f675bb5ac1396596da1f66821141b69'; // Replace with the actual contract address
const contractABI = JSON.parse(abiJSON);
// Replace with actual contract ABI
const mintFunction = 'mint'; // Replace with actual minting function name

// Define value and payment token
const value = 0.01; // Replace with actual value in SETH or other token
const paymentToken = 'SETH'; // Replace with actual payment token symbol

// Create a web3 instance
const web3 = new Web3(window.ethereum);

// Create a contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Define a function to mint an NFT
export async function mintToken() {
    // Check if the user has connected their wallet
    if (window.ethereum) {
        try {
            // Get the user address
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAddress = accounts[0];

            // Get the network ID
            const networkId = await ethereum.request({ method: 'net_version' });

            // Check if the network ID is Sepolia's (1337)
            if (networkId === '11155111') {
                try {
                    // Calculate the value in wei
                    const valueInWei = web3.utils.toWei(value.toString(), 'ether');

                    // Estimar o gás para a função mint
                    const estimatedGas = await contract.methods.mintWithFee().estimateGas({ from: userAddress, value: valueInWei});
                    const safeGas = estimatedGas * BigInt('10')
                

                    const encodedABI = contract.methods.mintWithFee().encodeABI();

                    // Check if the payment token is SETH or another token
                    if (paymentToken === 'SETH') {
                        // Mint the NFT using SETH as payment
                        await contract.methods.mintWithFee().send({ from: userAddress, value: valueInWei, gas: safeGas, data: encodedABI});
                    
    
                    } 

                    // Log success message
                    console.log('NFT minted successfully!');
                } catch (error) {
                    // Log error message
                    console.error('Error minting NFT:', error);
                }
            } else {
                // Log error message
                console.error('Please switch to Sepolia network');
            }
        } catch (error) {
            // Log error message
            console.error(error);
        }
    } else {
        // Log error message
        console.error('Please connect your wallet');
    }
};