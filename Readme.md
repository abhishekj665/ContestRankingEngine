# Creator Contest Ranking Engine

React frontend with two independent Express services: User Service (MongoDB) owns creator, post, and engagement data; Admin Service (PostgreSQL with Prisma) creates immutable ranking snapshots, winners, and KYC decisions. The services never share database access.


## Demo credentials

After running the seed commands below, use these credentials in the login screen:

| Role | Username / email | Password |
| --- | --- | --- |
| User | Username: `john123`<br>Email: `john@gmail.com` | `John@123` |
| Admin | Email: `admin@example.com` | `Admin123` |

Set `ADMIN_EMAIL=admin@example.com` and `ADMIN_PASSWORD=Admin123` in `admin-service/.env` before running `npm.cmd run seed:admin`.

## Data model

**MongoDB / User Service**

- `User`: name, unique email/username, bcrypt password, normalized residency, derived `isContestEligible`.
- `Post`: uploaded media URL/type, caption, one of ten categories, engagement counters, author, timestamps. Indexed by category/date and author/date.
- `Like`: unique `(userId, postId)` pair.
- `Comment`: post, user, content, timestamps.

**PostgreSQL / Admin Service**

- `Admin`: unique email and bcrypt password hash.
- `RankingRun`: timestamped, immutable JSON snapshot of all ranking inputs and allocations.
- `Winner`: ranking-run user, tier, category, score, KYC status, optional `kycRequestedAt`. A database uniqueness constraint enforces one award per user per ranking run.

## Ranking rules

The User Service calculates each post score as `likes + (comments * 3) + (views * 0.2)`. Ties use more comments, then more views, then earlier post timestamp.

- Global and category rankings retain each creator's best applicable post.
- Consistency requires at least three posts in each of the current and three previous Sunday-Saturday weeks. It adds each week’s best three scores; equal totals use aggregate comments, aggregate views, then earliest selected post.
- Award order is Grand (1), Consistency 1st (1), Consistency 2nd (1), Top Performer (10), category firsts (10), then category seconds (10). A winner is excluded from every later tier.
- A multi-category leader retains only their strongest category; other category slots cascade. An exhausted category second place remains vacant.

## API contract

All responses use `{ success, message, data }`. User and admin JWTs use separate secrets. The browser stores one role-scoped session, so an admin token is never sent to User Service and vice versa.

| Service | Route | Purpose |
| --- | --- | --- |
| User | `POST /api/users/register`, `POST /api/users/login` | Creator account and JWT |
| User | `PATCH /api/users/update/residency` | Set residency / derived eligibility |
| User | `POST /api/posts` | Authenticated multipart media post |
| User | `GET /api/posts`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comment` | Feed and engagement |
| Admin | `POST /admin/auth/login` | Admin JWT |
| Admin | `POST /api/rankings/run` | Create a ranking snapshot and winners |
| Admin | `GET /api/rankings/latest`, `GET /api/rankings/:rankingRunId` | Read snapshots |
| Admin | `GET /api/winners?tier=&rankingRunId=` | Winners; defaults to latest run |
| Admin | `POST /api/winners/:id/kyc/request` | Record KYC request |
| Admin | `POST /api/winners/:id/kyc/pass`, `POST /api/winners/:id/kyc/fail` | Finalize KYC and cascade failures |

The Admin Service calls User Service's `/internal/scored-posts`, `/internal/eligible-users`, and `/internal/weekly-top-three` endpoints using `x-internal-key`; browsers cannot use these endpoints.

## KYC cascade

KYC must be requested before it can be passed or failed. A failed winner is excluded permanently from its ranking run and hidden from active winners. The replacement is chosen only from that run's saved snapshot; every winner in the run, including previously failed users, is excluded. This allows repeated failures without re-awarding anyone or crossing into another run.

## Setup and sample data

Configure `.env` for MongoDB, PostgreSQL, both JWT secrets, `INTERNAL_SERVICE_KEY`, and the two service/client URLs. Then:



```powershell
cd admin-service
npm.cmd run db:deploy
npm.cmd run db:generate
npm.cmd run seed:admin
npm.cmd run seed:reset

cd ..\user-service
npm.cmd run seed
```

Start both services and the client, log in as an admin, and run a ranking. To demonstrate the Travel KYC chain after the run:

```powershell
cd admin-service
npm.cmd run seed:kyc-cascade
```

The sample data covers a multi-category leader, score tie, a creator missing consistency by one week, an ineligible Maharashtra creator, an exhausted Lifestyle second place, all fixed categories, and a two-step Travel KYC cascade.

## Verification

```powershell
cd admin-service
npm.cmd test
npx.cmd prisma validate

cd ..\client
npm.cmd run build
```

The tests cover ranking ties, global/category selection, consistency eligibility, category conflict/cascade behavior, no duplicate awards, and chained KYC replacements.
