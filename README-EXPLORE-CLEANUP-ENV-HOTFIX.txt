Explore launch cleanup environment hotfix

This replaces scripts/delete-launch-test-property.mjs.
The script now automatically loads both .env.local and .env before connecting to PostgreSQL.

Run from the project root:
  node scripts/delete-launch-test-property.mjs
