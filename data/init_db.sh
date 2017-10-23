#!/bin/bash
set -e

psql -c "CREATE DATABASE transport_db"
ogr2ogr -f "PGDump" "./sql/HPD_RecentCrime.sql" "../static/HPD_RecentCrime.geojson" -nln "crime"
psql -d "transport_db" < "./sql/Enable_POSTGIS.sql"
psql -d "transport_db" < "./sql/HPD_RecentCrime.sql"


