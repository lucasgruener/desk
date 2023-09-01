const fs = require('fs');

const nftsMetadata = [];

for (let tokenId = 0; tokenId <= 99; tokenId++) {
  const metadata = {
    name: `NFT ${tokenId}`,
    description: `Desk's premium furniture`,
    image: `https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/images/${tokenId}.jpg`,
    sprite: `https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/sprites/${tokenId}.jpg`,
    tokenId: tokenId,
    type: `none`,
    style: `none`,
    collection: 1
  };

  nftsMetadata.push(metadata);
}

const combinedMetadataPath = 'furniture_metadata.json';
fs.writeFileSync(combinedMetadataPath, JSON.stringify(nftsMetadata, null, 2));
console.log(`Created combined metadata file for all NFTs`);