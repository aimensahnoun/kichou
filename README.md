![Kichō](https://user-images.githubusercontent.com/62159014/205102869-6e57217c-98b1-4a53-a36a-f396cfdca54f.png)

  
  

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) ![Lines of code](https://img.shields.io/tokei/lines/github/aimensahnoun/kichou) ![GitHub top language](https://img.shields.io/github/languages/top/aimensahnoun/kichou)

  

**Kichou (Kichō - **貴重**)**: means `Precious` or `Valuable` in Japanese, is an **NFT Marketplace** project, that aims to create the `Marketplace of Wonders`.

  

## Front-end

The front-end of Kichō is built using `Next.JS` and aims to provide one of the best user experienecs when it comes to NFT marketplaces.

  

### Tanstack Query/React Query

[`Tanstack Query`](https://tanstack.com/query/v4) is a data management module, that allows for `Data-Prefetching`,`Caching`,and `Invalidating Data `. This means that Kichō start fetching data that the user needs before they are even at the screen that needs the data.

  

An example of that would be that the `Collection List` is fetched from the smart contract when the user is in the landing page, meaning once the user opens the Marketplace, they already see the collections loading. Another significant prefetch, is the fetching of `All NFTs` in a collection when the collection is first loaded, this helps reduce the time that the user has to wait.

  

All data that is `Prefetched` or `Fetched` in time is cached automatically using `Tanstack Query`, meaning as long as a user does not refresh the page they will not see a loading spinner.

  

Well, what happens if the data gets old? we don't want the user to see old data. `Tanstack Query` takes care of that too, it automatically refetches data after a certain period of time, and after every significant action, data is `invalidated` by the front-end, and new data is fetched.

  

#### Too much data?

One issue that can arise from this, is since we are prefetching and caching so much data, it can slow down the user's network and make the app slow.

  

Since data is only fetched on render of components (Collection/NFT), we could prevent that by only rendering elements that are visible on the screen, in turn fetching only needed data.

  

Basically, instead of rendering 1000 collections at once, we can only render the 10 collections visible on screen and only fetch their data. And this can be done with [`Tanstack Virtual`](`https://tanstack.com/virtual/v3`)

  

### Tech Used
The front-end is build on [`NextJS`](https://nextjs.org) as previously mentioned. For styling [`TailwindCSS`](https://tailwindcss.com) is used, when it comes to global state management [`Jotail`](https://jotai.org) is used.

  

[`RainbowKit`](https://www.rainbowkit.com) is used to handle wallet connection, in tandom with [`Ethers`](https://docs.ethers.org/v5/) to interact with the smart contract.

[`Web3 Storage`](https://web3.storage) is used to upload and index NFT metadata onto IPFS.

### Environment Variables

To run this project, you will need to add the following environment variables to your .env file


```
# Infura API key for Alchemy Fuji
NEXT_PUBLIC_INFURA_KEY = 

# Infura Alchemy Fuji RPC url
NEXT_PUBLIC_ALCHEMY_FUJI =

# Web3 Storage API key
NEXT_PUBLIC_WEB3STORAGE = 

```

### Smart Contracts

If you want to use your own deployed smart contrants you should change the addresses in `src/const/contracts/contractInfo.ts`


```
export const MARKETPLACE_ADDRESS = YOUR OWN CONTRACT ADDRESS
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/aimensahnoun/kichou
```

Go to the project directory

```bash
  cd kichou/nextjs
```

Install dependencies

```bash
  npm install

  #or

  yarn instal
```

Start the server

```bash
  npm run dev

  #or

  yarn dev

```

### Folder Structure

```

📦

 nextjs

   ├─ .eslintrc.json

   ├─ .gitignore

   ├─ .vscode

   │  └─ settings.json

   ├─ next.config.js

   ├─ package.json

   ├─ postcss.config.js

   ├─ public

   │  ├─ 404.png

   │  ├─ avalanche-logo.svg

   │  ├─ empty-collection.png

   │  ├─ empty.png

   │  ├─ favicon-light.ico

   │  ├─ favicon.ico

   │  ├─ hero 1.png

   │  ├─ hero.svg

   │  ├─ images

   │  │  ├─ favicon-dark.ico

   │  │  └─ favicon-light.ico

   │  ├─ logo.svg

   │  └─ polygon-logo.svg

   ├─ src

   │  ├─ components

   │  │  ├─ collection.tsx

   │  │  ├─ create-collection-modal.tsx

   │  │  ├─ navbar.tsx

   │  │  ├─ nft.tsx

   │  │  └─ offers-modal.tsx

   │  ├─ const

   │  │  └─ contracts

   │  │     ├─ MarketItem.json

   │  │     ├─ MarketItemFactory.json

   │  │     └─ contractInfo.ts

   │  ├─ hooks

   │  │  ├─ collection.ts

   │  │  ├─ nft.ts

   │  │  └─ useSystemTheme.ts

   │  ├─ pages

   │  │  ├─ 404.tsx

   │  │  ├─ [user]

   │  │  │  └─ index.tsx

   │  │  ├─ _app.tsx

   │  │  ├─ api

   │  │  │  └─ hello.ts

   │  │  ├─ collection

   │  │  │  └─ [id]

   │  │  │     ├─ [nftid]

   │  │  │     │  └─ index.tsx

   │  │  │     ├─ index.tsx

   │  │  │     └─ mint-nft.tsx

   │  │  ├─ index.tsx

   │  │  └─ marketplace.tsx

   │  ├─ styles

   │  │  ├─ Home.sass

   │  │  └─ globals.css

   │  └─ utils

   │     ├─ file-uploader.tsx

   │     └─ global-state.ts

   ├─ tailwind.config.js

   ├─ tsconfig.json

   ├─ turbo.json

   └─ yarn.lock

```

  

## Smart Contracts

Kichō is made out of two smart contracts, `MarketItem` which is an `ERC721` contract extension in order to create collections and mint NFTs.


As well as `MarketPlace` which is a custom smart contract that stores the data and functionality fo the market place.

### MarketItem

```
safeMint
```

Method used to mint a new NFT for the collection and setting token uri

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `to`      | `address`       | The address of the owner of the NFT  |
| `uri`   | `string`        | The token URI of the NFT    |


```
tokenURI
```

Method used to get a specific NFT URI

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `tokenId`      | `uint256`       | Returns the token URI of an NFT  |


```
getNFTCount
```

Return NFT count in the collection


### MarketPlace

```
createMarketItem
```

This function is used to create a new collection

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `name`      | `string`       | The name of the collection |
| `symbol`   | `string`        | The symbol of the collection    |

```
getCollections
```

This function is used to get all the collections created on the marketplace

```
getCollectionsForOwner
```

This function is used to get all the collections created by a specific user

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `owner`      | `address`       | The address of the user |

```
getOwnerOfCollection
```

This function is used to get the owner of a specific collection

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the collection |

```
collectionCount
```

This function is used to get the number of collections created on the marketplace

```
mintNFT
```

his function is used mint a new NFT in a collection, This can only be called by the owner of the collection

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the collection |
| `to`      | `address`       | The address of the recipient |
| `tokenURI`      | `string`       | The token URI of the NFT, this is the metadata of the NFT (image, name, description, etc.) |

```
getCollectionByUser
```

This function is used to get all collections created by a specific user

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `owner`      | `address`       | The address of the user |

```
totalNFTCount
```

This function is used to get the count of NFTs

```
putNFTForSale
```

This function that allows the user to put their NFT for sale

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |
| `price`      | `uint256`       | The price of the NFT |


```
removeNFTFromSale
```

This function is used to remove an NFT from sale

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |


```
makeOfferForNFT
```

This function is used to make an offer for an NFT

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |

```
widthdrawOfferForNFT
```

This function is used to withdraw an offer previously made by the user

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |

```
acceptOfferForNFT
```

This function is used to accept an offer for an NFT,NFT owner needs to approve this contract to transfer the NFT before calling this function, otherwise the transaction will fail

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |
| `buyer`      | `address`       | The address of the buyer |

```
rejectOfferForNFT
```

This function is used to reject an offer for an NFT

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |
| `buyer`      | `address`       | The address of the buyer |

```
buyNFT
```

This function is used to buy an NFT that is for sale , NFT owner needs to approve this contract to transfer the NFT before calling this function, otherwise the transaction will fail

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |


```
hasUserMadeOfferOnNFT
```

This function is used to check whether a user has made an offer on an NFT

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `user`      | `address`       | The address of the user |
| `collection`      | `address`       | The address of the user |
| `tokenId`      | `uint256`       | The token id of the NFT |

```
ownerToNFTs
```

This function is used to get all the NFTs for a user

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `owner`      | `address`       | The address of the user |


```
getOffersForNFT
```

This function is used to get all the offers for an NFT

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `collection`      | `address`       |The address of the collection |
| `tokenId`      | `uint256`       |The token id of the NFT |


```
withdrawMarketPlaceProfit
```

This function is used to withdraw the market place profit can be called only by the owner of the contract

## Environment Variables
```
# Wallet Private Key
PRIVATE_KEY=

# Avalanche Snowtrace API key
SNOWTRACE= 

```
## Run Locally

Clone the project

```bash

git clone https://github.com/aimensahnoun/kichou

```

Go to the project directory

```bash

cd kichou/hardhat

```

Install dependencies

```bash

npm install

  

#or

  

yarn install

```

## Running Tests

To run tests, run the following command

```bash

hardhat test

```

To coverage tests, run the following command

```bash

hardhat coverage

```

![Coverage](https://user-images.githubusercontent.com/62159014/207424826-ef13fda2-f8fa-4f61-9e6c-4ec8f37cf4d3.png)

## Deployment
To deploy this project run

```bash

hh run --network NETWORK scripts/deploy.ts

```

```
📦 
 hardhat
│  ├─ .gitignore
│  ├─ README.md
│  ├─ contracts
│  │  ├─ MarketItem.sol
│  │  └─ Marketplace.sol
│  ├─ hardhat.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ scripts
│  │  ├─ create-collection.ts
│  │  ├─ deploy.ts
│  │  └─ mint_nft.ts
│  ├─ test
│  │  ├─ MarketItem.ts
│  │  └─ MarketPlace.ts
│  ├─ tsconfig.json
│  ├─ yarn-error.log
│  └─ yarn.lock
```
