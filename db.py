import sqlalchemy

def create_engine(config):
    return sqlalchemy.create_engine(config["SQLALCHEMY_DATABASE_URI"], pool_size=20)


def crimes(engine, limit=None):
    with engine.connect() as connection:
        limit_clause = ""
        if limit is not None:
            limit_clause = "limit {limit}".format(limit=int(limit))
        return (connection
                .execute("""SELECT row_to_json(fc)
                            FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                            FROM (SELECT 'Feature' As type
                                , ST_AsGeoJSON(lg.wkb_geometry)::json As geometry
                                , row_to_json(lp) As properties
                            FROM crime As lg
                                    INNER JOIN (SELECT offense, time_begun, ogc_fid FROM crime) As lp
                                ON lg.ogc_fid = lp.ogc_fid {limit_clause} ) As f )  As fc;""".format(limit_clause=limit_clause))
                .fetchone()[0])
