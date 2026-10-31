#!/usr/bin/env bash
# Exécute la migration, le seed et le scénario de bout en bout sur un PostgreSQL local temporaire.
# Prérequis : PostgreSQL 15+ installé (ex. `brew install postgresql@17`).
# Usage : PGBIN=/opt/homebrew/opt/postgresql@17/bin ./supabase/tests/run_local.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
PGBIN="${PGBIN:-$(dirname "$(command -v pg_ctl)")}"
PORT="${PORT:-54329}"
PGD="$(mktemp -d)/pgdata"
cleanup() { "$PGBIN/pg_ctl" -D "$PGD" stop -m fast >/dev/null 2>&1 || true; }
trap cleanup EXIT
"$PGBIN/initdb" -D "$PGD" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
"$PGBIN/pg_ctl" -D "$PGD" -o "-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=" -l "$PGD/../pg.log" -w start >/dev/null
psqlh() { "$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
psqlh -d postgres -c "create database heroes"
psqlh -d heroes -f "$HERE/tests/00_stubs.sql"
for f in "$HERE"/migrations/*.sql; do
  psqlh -d heroes -f "$f" && echo "migration $(basename "$f") OK"
done
psqlh -d heroes -f "$HERE/seed.sql" && echo "seed OK"
"$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -d heroes -f "$HERE/tests/10_scenario.sql"
"$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -d heroes -f "$HERE/tests/20_admin.sql"
