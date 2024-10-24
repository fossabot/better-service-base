[![Docker Image Size](https://img.shields.io/docker/image-size/betterweb/service-base/latest)](https://hub.docker.com/r/betterweb/service-base)[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FBetterCorp%2Fbetter-service-base.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FBetterCorp%2Fbetter-service-base?ref=badge_shield)

[![Docker Pulls](https://img.shields.io/docker/pulls/betterweb/service-base)](https://hub.docker.com/r/betterweb/service-base)
[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/betterweb/service-base?sort=semver)](https://hub.docker.com/r/betterweb/service-base)
[![GitHub](https://img.shields.io/github/license/BetterCorp/better-service-base)](https://github.com/BetterCorp/better-service-base)
[![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/bettercorp/better-service-base/master)](https://github.com/BetterCorp/better-service-base)
[![GitHub last commit (branch)](https://img.shields.io/github/last-commit/bettercorp/better-service-base/develop)](https://github.com/BetterCorp/better-service-base)
[![GitHub Repo stars](https://img.shields.io/github/stars/BetterCorp/better-service-base)](https://github.com/BetterCorp/better-service-base)
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/BetterCorp/better-service-base)](https://github.com/BetterCorp/better-service-base/pulls)
[![GitHub issues](https://img.shields.io/github/issues-raw/BetterCorp/better-service-base)](https://github.com/BetterCorp/better-service-base/issues)
[![Build and Publish (EA)](https://github.com/BetterCorp/better-service-base/actions/workflows/develop.yml/badge.svg?branch=develop)](https://github.com/BetterCorp/better-service-base/actions/workflows/develop.yml)
[![Build and Publish (RC)](https://github.com/BetterCorp/better-service-base/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/BetterCorp/better-service-base/actions/workflows/master.yml)
[![codecov](https://codecov.io/gh/BetterCorp/better-service-base/branch/master/graph/badge.svg)](https://codecov.io/gh/BetterCorp/better-service-base)
[![node-current (scoped)](https://img.shields.io/node/v/@bettercorp/service-base)](https://www.npmjs.com/package/@bettercorp/service-base)  
[![npm](https://img.shields.io/npm/dt/@bettercorp/service-base)](https://www.npmjs.com/package/@bettercorp/service-base)
[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@bettercorp/service-base)](https://www.npmjs.com/package/@bettercorp/service-base)
[![npm (scoped)](https://img.shields.io/npm/v/@bettercorp/service-base)](https://www.npmjs.com/package/@bettercorp/service-base)
[![Docker Sponsored Open Source](data:image/png;base64,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)](https://hub.docker.com/r/betterweb/service-base) 

# Better-Service-base for distributed Micro-Services

This base allows for easy distributed service platform development.

## Getting started

View the docs here: [https://bsbcode.dev/](https://bsbcode.dev/)

## Sponsors  

[BetterCorp](https://www.bettercorp.dev)  
[Docker](https://www.docker.com)  
[BrowserStack](https://www.browserstack.com/)  

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FBetterCorp%2Fbetter-service-base.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FBetterCorp%2Fbetter-service-base?ref=badge_large)