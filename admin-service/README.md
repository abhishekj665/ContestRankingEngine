# Admin service database

The admin service connects directly to a locally installed PostgreSQL instance; Docker is not required.

1. Ensure PostgreSQL is running on your machine.
2. Create the database and role if they do not already exist:

```sql
CREATE USER contest_admin WITH PASSWORD 'contest_admin_password';
CREATE DATABASE contest_ranking_admin OWNER contest_admin;
```

3. Set `DATABASE_URL` in `.env` to match your local credentials. The default is:

```env
DATABASE_URL="postgresql://contest_admin:contest_admin_password@localhost:5432/contest_ranking_admin?schema=public"
```

4. Apply the schema:

```sh
npm run db:deploy
```
