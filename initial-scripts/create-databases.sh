#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE message_db_tst;
	CREATE DATABASE message_db_dev;
	CREATE DATABASE message_db_prod;
	GRANT ALL PRIVILEGES ON DATABASE message_db_tst TO docker;
	GRANT ALL PRIVILEGES ON DATABASE message_db_dev TO docker;
	GRANT ALL PRIVILEGES ON DATABASE message_db_prod TO docker;
EOSQL
