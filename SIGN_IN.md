# Retained sign-in module

The dashboard and shared design files are restored to commit `8c862f7c55c4ea17b238f758711e342b69821786`. The local sign-in server retains password authentication, first-account setup, secure session cookies, CSRF checks, rate limiting and sign-out.

Run `npm start` and open http://localhost:3000. Existing accounts remain in `data/commerceos.sqlite`. On a fresh database, create the first account at `/setup`. The restored dashboard runs its original prototype interactions; the newer commerce backend, ledger and Shopify connector are not enabled.

`npm test` checks sign-in and protected dashboard access. `npm run user:create` and `npm run db:backup` remain available. Serve through HTTPS with `COMMERCEOS_SECURE_COOKIE=1` when configuring a secure host.

The pre-rollback source recovery archive is `/private/tmp/commerceos-before-rollback/workspace.tar.gz`. The account database was preserved separately in place and was not included in that archive.
