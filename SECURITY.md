# Security Notes

- JWT identity is taken from the Authorization header.
- User IDs are never accepted for streak/wallet ownership.
- Claim reward values are loaded from MongoDB.
- Client-supplied day/amount/currency are not authoritative.
- Claim requests are rate-limited.
- Authentication endpoints are rate-limited.
- Claim uniqueness is enforced with a MongoDB unique index.
- Wallet, claim, transaction and cycle updates run inside a MongoDB transaction.
- CPA completion is tied to the authenticated user.
- Raw database errors are not returned by streak controllers.
- `.env` files are ignored by Git.
- Demo mode still uses JWT and protected backend routes.
