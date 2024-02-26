# Basic oracle example

> Important: This project is not production ready. It is a basic POC developed quickly to participate to the Hackathon. It requires security check, auditt and refactoring to be used in production.


## Install

```
npm install
```

## Start a local devnet for testing and development

Please refer to the documentation here: https://wiki.alephium.org/full-node/devnet

## Compile and deploys

Compile the TypeScript files into JavaScript:

```bash
npx @alephium/cli@latest compile && npx @alephium/cli@latest deploy --network devnet
```

The deploymnet script is actually deploying :

* All oracle contracts and templates for sub contract
* An dapp example which is using the oracle to retrieve the alph price in usdt


## Running the oracle 

A basic scripting has been created. This is not a script to be run in production. 
Ideally, a nestjs api would listen / store the requests to be performed and handle errors properly.

The script is actually a loop which executes request every 1s until you stop the script.


```bash
npm run build && node dist/src/operator-fullfill-requests.js
```

## Running the consumer

A script for the demo dapp was created. It will actually request a price fetch that will be fed by the oracle.

When you start the script, there are 3 possibilities :

- A price fetch was not requested : The script sign a transaction to request a price fetch
- A price fetch was requested and not answered by oracle : The script does nothing : "Waiting for the oracle to fulfill the request"
- A price fetch was requested and fulfuilled by oracle : The script stores the prices in the smart contract and destroy the request to retrieve the alphs

## Todo

- Retrieve real price from at least 2 apis
- Handle the fees properly and send them to Sezame.

## Testing

Unit test have not been implemented yet. 

```bash
npx @alephium/cli@latest test
```
