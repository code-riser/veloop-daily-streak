# API Documentation

All protected endpoints use:

`Authorization: Bearer <JWT>`

## GET /api/daily-streak

Returns server time, active cycle, current day/streak, wallet totals, next claim timestamp and seven reward states.

## POST /api/daily-streak/claim

Body:

```json
{
  "cpaEventId": "CPA-..."
}
```

The backend derives the user from JWT and derives day/reward/amount/currency from MongoDB.

Validation:
- authenticated user
- valid active cycle
- no missed claim window
- current day
- server-controlled timer
- active reward configuration
- completed CPA demo owned by the same user
- duplicate claim protection
- wallet + transaction + claim update in one MongoDB transaction

## GET /api/daily-streak/history

Returns paginated claim history for the authenticated user.

## GET /api/wallet

Returns the authenticated user's VES and Amazon gift-card balances.

## GET /api/transactions

Returns successful wallet ledger entries for the authenticated user.
