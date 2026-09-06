# Contest Ranking Engine

Two services power the contest: **User Service** stores users and engagement in MongoDB; **Admin Service** calculates, snapshots, and manages winners in PostgreSQL.

## Data model

### User Service (MongoDB)

- **User:** `_id`, `name`, unique `email`, unique `username`, bcrypt-hashed `password`, lower-cased `residency`, derived `isContestEligible`, `createdAt`, `updatedAt`.
- **Post:** `_id`, required `media` URL, optional `caption`, required `category`, `viewCount`, `likeCount`, `commentCount`, `author` (User id), `createdAt`, `updatedAt`.
- **Like:** `_id`, `userId`, `postId`, timestamps. `(userId, postId)` is unique, so a user can like a post only once.
- **Comment:** `_id`, `userId`, `postId`, `content`, timestamps.

### Admin Service (PostgreSQL)

- **Admin:** auto-increment `id`, unique `email`, bcrypt `passwordHash`, `createdAt`.
- **RankingRun:** cuid `id`, `runAt`, JSON `snapshot` containing the source rankings and calculated allocations; related `winners`.
- **Winner:** cuid `id`, `userId` (the MongoDB User id), `tier` (`GRAND`, `CONSISTENCY_1`, `CONSISTENCY_2`, `TOP_PERFORMER`, `CATEGORY_1ST`, or `CATEGORY_2ND`), optional `category`, `score`, `status` (`PENDING_KYC`, `PASSED`, `FAILED`, `REMOVED`), optional `rankingRunId`, `createdAt`.

All successful API responses use `{ success: true, message, data }`; handled errors use `{ success: false, message }`.

## API contract

`Bearer <user JWT>` means the token returned by user login. `Bearer <admin JWT>` means the token returned by admin login.

### User Service — public API

| Method and path | Auth | Request | Result (`data`) |
| --- | --- | --- | --- |
| `POST /api/users/register` | None | `name`, `email`, `username`, `password`, `residency` | New user id (201) |
| `POST /api/users/login` | None | Exactly one of `email` or `username`, plus `password` | `{ userId, token }` (200); also sets an HTTP-only `token` cookie |
| `PATCH /api/users/update/residency` | User bearer token | `{ residency }` | Updated User (200) |
| `POST /api/users/logout` | User bearer token | None | `null` (200); clears the `token` cookie |
| `POST /api/posts` | User bearer token | `title`, `media` (URL), `category`, optional `caption` | Created Post (201) |
| `GET /api/posts?category=&page=&limit=` | None | Optional category and pagination query parameters | Posts, newest first (200) |
| `POST /api/posts/:id/like` | User bearer token | None | Created Like (201) |
| `POST /api/posts/:id/comment` | User bearer token | `{ content }` (1–500 chars) | Created Comment (201) |

Post categories are `Technology`, `Education`, `Sports`, `Entertainment`, `Travel`, `Food`, `Fashion`, `Fitness`, `Business`, and `Lifestyle`.

### Admin Service — public API

| Method and path | Auth | Request | Result (`data`) |
| --- | --- | --- | --- |
| `POST /admin/auth/login` | None | `{ email, password }` | `{ token }` (200) |
| `POST /api/rankings/run` | Admin bearer token | None | `{ rankingRun, winners }` (201) |
| `GET /api/rankings/latest` | Admin bearer token | None | Most recent RankingRun (200) |
| `GET /api/rankings/:rankingRunId` | Admin bearer token | None | Requested RankingRun (200) |
| `POST /api/winners` | Admin bearer token | `userId`, `tier`, numeric `score`, optional `category` | Created Winner (201) |
| `GET /api/winners?tier=` | Admin bearer token | Optional tier filter | Non-failed/non-removed Winners (200) |
| `POST /api/winners/:id/kyc/pass` | Admin bearer token | None | Winner with `PASSED` status (200) |
| `POST /api/winners/:id/kyc/fail` | Admin bearer token | None | `{ failedWinner, replacementWinner }` (200) |

### Internal Admin ↔ User Service API

These endpoints are not for browsers. Admin Service sends the shared `x-internal-key` header; User Service rejects a missing or mismatched key with `401`.

| Method and path | Returned `data` |
| --- | --- |
| `GET /internal/scored-posts` | Eligible users’ posts: `postId`, `userId`, `category`, engagement counts, calculated `score`, `createdAt` |
| `GET /internal/eligible-users` | Eligible users: `userId`, `name`, `username`, `residency`, `isContestEligible` |
| `GET /internal/weekly-top-three` | Each eligible poster’s four weekly buckets, each with `postCount`, three highest-scoring posts, and `weekScore` |

## Assumptions and rules

- A user is contest-eligible only when their lower-cased residency is exactly `chhattisgarh`. Eligibility is derived whenever a User is saved.
- Scoring is computed in **User Service**, not Admin Service: `likeCount × 1 + commentCount × 3 + viewCount × 0.2`.
- Every successful `GET /api/posts` increments `viewCount` once for every post returned. Views are not de-duplicated by visitor, session, or post detail page.
- Contest weeks run Sunday through Saturday in the application server’s local time. Week 1 is the current calendar week; weeks 2–4 are the three preceding weeks. No explicit contest start date or UTC normalization is configured.
- Ranking ties are resolved by higher score, then more comments, then more views, then earlier `createdAt`.
- Global and category rankings use each user’s best post. Consistency requires at least three posts in every one of the four weeks and sums only each week’s top three scores.
- One user can receive only one award in a ranking run. Awards are allocated in this order: grand, two consistency prizes, ten top-performer prizes, category firsts, then category seconds. A failed KYC winner is replaced by the next available candidate from the saved ranking snapshot.
- Service-to-service authentication is a shared `INTERNAL_SERVICE_KEY` in `x-internal-key`, not OAuth or user JWT delegation.
- User and admin JWTs use separate secrets. User login also sets a secure, cross-site HTTP-only cookie, but protected API routes read the bearer token from `Authorization`.
- Pagination accepts positive numeric `page` and `limit` values and is capped at 100 posts per request.
