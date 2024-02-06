[![test](https://github.com/veFarm/client/workflows/test/badge.svg)](https://github.com/veFarm/client/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/vearnfi/client/badge.svg?branch=main)](https://coveralls.io/github/vearnfi/client?branch=main) [![Maintainability](https://api.codeclimate.com/v1/badges/fdd1d0c953b7d5565216/maintainability)](https://codeclimate.com/github/veFarm/client/maintainability)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c6966685-9414-4895-85f8-10b42cd3bc43/deploy-status)](https://app.netlify.com/sites/symphonious-macaron-41163f/deploys)

# @vearnfi/client

Interface for the vearn Protocol supporting Connex instances for VeWorld and Sync2.

Live version (testnet): [https://vearn.finance](https://vearn.finance)

This DApp was built with Svelte.

## Available Scripts

Clone the project:

```
git clone git@github.com:vearnfi/client.git
```

Copy `.env.example` into `.env` and set your environmental variables:

```
cp .env.example .env
```

Install deps:

```
npm install
```

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

```
npm test
npm run coverage
npm run cy:e2e
```

## Storybook

```
npm run storybook
```
