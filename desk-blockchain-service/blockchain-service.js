const express = require('express');
const app = express();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const PORT = 3001;

app.use(express.json());
app.use(cors())
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/sprites', express.static(path.join(__dirname, 'sprites')));

app.get('/token/', async (req, res) => {

    let furniture
    try {
        const furnitureJSON = fs.readFileSync('./furniture_metadata.json', 'utf8');
        furniture = JSON.parse(furnitureJSON);
        console.log('Combined NFTs Metadata:', furniture);
    } catch (error) {
        console.error('Error reading or parsing combined metadata:', error);
    }

    res.json(furniture[req.query.id]);
});

app.get('/get-user-nfts', async (req, res) => {
    try {
        const userAddress = req.query.userAddress;

        const provider = new ethers.providers.JsonRpcProvider('https://rpc.sepolia.org');

        const contractAddress = '0xc3dd7ea90f675bb5ac1396596da1f66821141b69'; // Replace with the actual contract address
        const abiJSON = fs.readFileSync('contractABI.json', 'utf8');

        // Parse the JSON content to get the ABI object
        const contractABI = JSON.parse(abiJSON);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const filterReceived = contract.filters.Transfer(null, userAddress);
        const filterSent = contract.filters.Transfer(userAddress, null);

        const batchSize = 2500; // Number of blocks to query at a time
        const latestBlockNumber = await provider.getBlockNumber();
        let fromBlock = 4200674; // Block start
       
        const receivedNFTs = [];
        const sentNFTs = [];

        try {
            while (fromBlock <= latestBlockNumber) {
               
                const toBlock = Math.min(fromBlock + batchSize - 1, latestBlockNumber);

                const receivedNFTsBatch = await contract.queryFilter(filterReceived, fromBlock, toBlock);
                const sentNFTsBatch = await contract.queryFilter(filterSent, fromBlock, toBlock);


                receivedNFTs.push(...receivedNFTsBatch);
                sentNFTs.push(...sentNFTsBatch);

                fromBlock = toBlock + 1; // Move to the next batch
            }
        } catch (error) {
            console.error('Error querying events:', error);
            res.status(500).json({ error: 'An error occurred while querying events.' });
            return;
        }


        // Extract token IDs from events
        const receivedTokenIDs = receivedNFTs.map(tx => tx.args.tokenId.toString());

        const sentTokenIDs = sentNFTs.map(tx => tx.args.tokenId.toString());
       
        // Calculate the difference to get the currently held NFTs
        const currentlyHeldTokenIDs = receivedTokenIDs.filter(tokenID => !sentTokenIDs.includes(tokenID));

        // You can now fetch additional information about these NFTs if needed


        // let testVariable = ["1"]
        res.json(currentlyHeldTokenIDs);
    } catch (error) {
        res.status(500).json(error)
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});