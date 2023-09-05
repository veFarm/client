[![test](https://github.com/veFarm/client/workflows/test/badge.svg)](https://github.com/veFarm/client/actions/workflows/test.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/fdd1d0c953b7d5565216/maintainability)](https://codeclimate.com/github/veFarm/client/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/fdd1d0c953b7d5565216/test_coverage)](https://codeclimate.com/github/veFarm/client/test_coverage)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c6966685-9414-4895-85f8-10b42cd3bc43/deploy-status)](https://app.netlify.com/sites/symphonious-macaron-41163f/deploys)

# VeFarm Interface

Interface for the VeFarm Protocol supporting Connex instances for VeWorld and Sync2.

Live version (testnet): [https://main--symphonious-macaron-41163f.netlify.app/](https://main--symphonious-macaron-41163f.netlify.app/)

This DApp was built with Svelte.

## Available Scripts

Clone the project:
```
git clone https://github.com/veFarm/client
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
```

## Storybook

```
npm run storybook
```
