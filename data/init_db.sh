#!/bin/bash
set -e

psql -c "CREATE DATABASE transport_db"
# ogr2ogr -f "PGDump" "./sql/HPD_RecentCrime.sql" "../static/HPD_RecentCrime.geojson" -nln "crime"
# Enable the PostGIS database extensions
psql -d "transport_db" < "./sql/Enable_POSTGIS.sql"

# Start importing the data
psql -d "transport_db" < "./sql/HPD_RecentCrime.sql"
psql -d "transport_db" < "./sql/busroutes.sql"
psql -d "transport_db" < "./sql/busstops.sql"
psql -d "transport_db" < "./sql/bike.sql"



