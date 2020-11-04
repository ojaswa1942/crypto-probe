# CryptoProbe
Identification & Curtailment of Honeypots on Decentralized Blockchain Networks using Machine Learning and Code Analysis.

## Abstract
Modern day blockchains enable the concept of "Smart Contracts”, which are programs executed across blockchains (decentralized nodes) which allow commitments comprising in the transfer of tokens or cryptocurrencies when certain conditions are met. The rise in popularity of cryptocurrencies and smart contracts has made them an interesting target for attackers. While the traditional attacking approach violates vulnerabilities in Smart Contracts, a new pattern towards a more proactive methodology is on the rise, where attackers do not look for for exploitable contracts anymore but instead, they themselves try to lure their users (victims) into traps by deploying seemingly vulnerable contracts that, upon execution, unfurl hidden traps. These new types of contracts are commonly referred to as Honeypots. CryptoProbe is a SaaS platform that employs symbolic execution, well-defined heuristics and data science techniques to enable large-scale, robust and efficient analysis of Smart Contracts on the Ethereum Blockchain Network to identify honeypots. While CryptoProbe is a way to integrate a security layer with existing wallets, APIs, and tools as a built-in feature or plugin, it can also be deployed as a standalone service.

## Getting started?
1. Fetch the repository
`git pull https://github.com/ojaswa1942/crypto-probe.git`

2. Go to project folder
`cd crypto-probe`

3. Start services using docker-compose. This will setup 4 images required for various components of this project. 
`docker-compose up`

4. You can get started by requesting the port `3000`

Kindly note that the database is not a part of compose services. 
You will need to setup 2 collections `auth` and `contracts` in a Mongo Instance and update the `src/.env` file accordingly. 

## API Reference
Endpoint | Request Body | Description
----- | :----: | --------
POST `/cryptoprobe/v1/auth` | `username` and `password` | Returns an AUTHENTICATION token (JWT) which is used to authenticate the user for further requests. 
POST `/cryptoprobe/v1/analyze` | `address` | Returns if a contract is honeypot or not. In case, the honeypot can be categorized, the appropriate category label is also returned.
POST `/cryptoprobe/v1/details` | `address` | Returns all details available about a smart contract. This can be considered like a verbose mode which returns additional data for reports and debugging. If the analysis is not available for the provided contract, an error is returned.

## Components
### API
This API creates a Service as a Service wrapper for the detection component, which can be integrated into applications and tools such as wallets, plugins and webapps. This service interacts with database and provides an interface for end-users to interact with. This service is labelled as `api` and runs on PORT `3000`.

### Detection System:
The detection system comprises of 2 major components doing the hard work. They are as follows:

#### 1. Code Analysis:
Leverages symbolic execution in order to detect smart contract honeypots. Labelled as `codeanalysis` service and runs on PORT `5001` internally.

#### 2. Machine Learning:
Uses a classification Machine Learning model to detect smart contract honeypots. Labelled as `ml` service and runs on PORT `5002` internally.

#### 3. Integration
Combines results from both the above components to generate final results weighted by reliability of each component. This service runs on PORT `5000` internally and is the gateway to the detection system. It is labelled as `detectionsystem` service.
