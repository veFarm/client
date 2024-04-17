[![test](https://github.com/veFarm/client/workflows/test/badge.svg)](https://github.com/veFarm/client/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/vearnfi/client/badge.svg?branch=main)](https://coveralls.io/github/vearnfi/client?branch=main) [![Maintainability](https://api.codeclimate.com/v1/badges/fdd1d0c953b7d5565216/maintainability)](https://codeclimate.com/github/veFarm/client/maintainability)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c6966685-9414-4895-85f8-10b42cd3bc43/deploy-status)](https://app.netlify.com/sites/symphonious-macaron-41163f/deploys)

# @vearnfi/client

Interface for the **vearn** protocol supporting Connex instances for VeWorld and Sync2.

Live version (testnet): [https://vearn.finance](https://vearn.finance)

This DApp was built with Svelte.

## Overview

1. Users can log in using either Sync2 or VeWorld wallet providers.
2. Users have the option to set a reserve balance via the UI, indicating the minimum balance that will be retained in their account after swaps.
3. If the logged-in account holds a positive VET balance, users can view a list of upcoming trades (swaps).
4. Users can authorize the **vearn** protocol to spend their VTHO tokens in exchange for VET.
5. Upon authorization, the backend service will monitor the user's account and initiate a swap once the VTHO balance reaches a certain threshold.
6. After a trade is executed, users can view a list of past trades and updated statistics associated with their account.
7. Users have the flexibility to adjust their reserve balance at any time.
8. Users can revoke authorization for the **vearn** protocol at any time.

## Getting started

Clone the project and set your environmental variables based on the provided example:

```
git clone git@github.com:vearnfi/client.git
cp .env.example .env
npm install
```

## Available scripts

Run in dev mode:

```
npm run dev
```

Build for production:

```
npm run build
```

Serve production build locally:

```
npm run preview
```

## Testing

The app is mainly covered using cypress integration tests. You can run all integration tests in interaction mode via `cy:open`

Start the app in one terminal

```
nvm use 18
npm run build
npm run preview
```

On a second terminal, run the test suit

```
npm run test:integration
```

Please, refer to the `e2e-coverage` folder for coverage report.

## Storybook

```
npm run storybook
```
