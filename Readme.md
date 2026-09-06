# Creator Contest Ranking Engine

This app lets creators share posts and take part in a contest. Admins can calculate rankings, manage winners, and complete KYC checks. It has a React frontend and two backend services: User Service and Admin Service.

## Demo credentials

After running the seed commands below, use these credentials in the login screen:

| Role | Username / email | Password |
| --- | --- | --- |
| User | Username: `john123`<br>Email: `john@gmail.com` | `John@123` |
| Admin | Email: `admin@example.com` | `Admin123` |

Set `ADMIN_EMAIL=admin@example.com` and `ADMIN_PASSWORD=Admin123` in `admin-service/.env` before running `npm.cmd run seed:admin`.

## Data model

The User Service stores day-to-day creator activity. The Admin Service stores contest decisions, so past results remain available even when new posts are added.

| Service | Data stored |
| --- | --- |
| User Service | Creator name, email, username, password, residency, and contest eligibility |
| User Service | Posts, uploaded media, category, likes, comments, views, author, and date |
| Admin Service | Admin sign-in details |
| Admin Service | Each ranking run, saved scores, winners, award type, and KYC status |

## Ranking rules

The User Service calculates each post score as `likes + (comments * 3) + (views * 0.2)`. Ties use more comments, then more views, then earlier post timestamp.

- Global and category rankings retain each creator's best applicable post.
- Consistency requires at least three posts in each of the current and three previous Sunday-Saturday weeks. It adds each week's best three scores; equal totals use aggregate comments, aggregate views, then earliest selected post.
- Award order is Grand (1), Consistency 1st (1), Consistency 2nd (1), Top Performer (10), category firsts (10), then category seconds (10). A winner is excluded from every later tier.
- A multi-category leader retains only their strongest category; other category slots cascade. An exhausted category second place remains vacant.

## API contract

All responses use `{ success, message, data }`. User and admin sign-ins use separate secrets, so an admin session is not sent to the User Service.

| Service | Route | Purpose |
| --- | --- | --- |
| User | `POST /api/users/register`, `POST /api/users/login` | Create a creator account and sign in |
| User | `PATCH /api/users/update/residency` | Save residency and update contest eligibility |
| User | `POST /api/posts` | Create a post with an image or video |
| User | `GET /api/posts`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comment` | View and interact with posts |
| Admin | `POST /admin/auth/login` | Admin sign in |
| Admin | `POST /api/rankings/run` | Create and save a ranking result |
| Admin | `GET /api/rankings/latest`, `GET /api/rankings/:rankingRunId` | Read saved ranking results |
| Admin | `GET /api/winners?tier=&rankingRunId=` | View winners; defaults to the latest run |
| Admin | `POST /api/winners/:id/kyc/request` | Start KYC verification |
| Admin | `POST /api/winners/:id/kyc/pass`, `POST /api/winners/:id/kyc/fail` | Complete KYC verification |

### Communication between services

The Admin Service asks the User Service for contest information through these private routes:

| User Service route | Information returned |
| --- | --- |
| `/internal/scored-posts` | Posts and their calculated scores |
| `/internal/eligible-users` | Creators allowed to participate |
| `/internal/weekly-top-three` | Weekly post results for consistency rankings |

Each private request must include the shared `x-internal-key`. These routes are for the Admin Service only and are not available to normal browser users. The two services do not directly access each other's databases.

## Assumptions

- A creator must meet the configured residency rule to be included in the contest.
- One creator can receive only one award in a ranking run.
- A ranking run is a saved snapshot. New likes, comments, views, or posts do not change a result that already exists.
- KYC must be requested before it can be passed or failed.
- If a winner fails KYC, a replacement is selected only from the same saved ranking run. If no suitable creator remains, the award stays vacant.

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
