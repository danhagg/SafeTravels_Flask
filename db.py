import sqlalchemy

def create_engine(config):
    return sqlalchemy.create_engine(config["SQLALCHEMY_DATABASE_URI"], pool_size=20)

def crimes(engine, limit=None, bounds=None):
    limit_clause = ""
    bounds_clause = ""
    if limit is not None:
        limit_clause = "limit {limit}".format(limit=int(limit))
    if bounds is not None:
        xmin, ymin, xmax, ymax = map(float, bounds)
        bounds_clause = "WHERE lg.wkb_geometry && ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax})".format(xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
        # -95.4, ymin=29.74589737002, xmax=-95.397,ymax=29.7584)
    with engine.connect() as connection:
        return (connection
                .execute("""SELECT row_to_json(fc)
                            FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                            FROM (SELECT 'Feature' As type
                                , ST_AsGeoJSON(lg.wkb_geometry)::json As geometry
                                , row_to_json(lp) As properties
                            FROM crime As lg
                                    INNER JOIN (SELECT offense, time_begun, premise_type, ogc_fid FROM crime) As lp
                                    ON lg.ogc_fid = lp.ogc_fid
                                    {bounds_clause} {limit_clause})
                            As f )
                            As fc; """.format(limit_clause=limit_clause, bounds_clause=bounds_clause))
                .fetchone()[0])


def busstops(engine, limit=None, bounds=None):
    limit_clause = ""
    bounds_clause = ""
    if limit is not None:
        limit_clause = "limit {limit}".format(limit=int(limit))
    if bounds is not None:
        xmin, ymin, xmax, ymax = map(float, bounds)
        bounds_clause = "WHERE lg.wkb_geometry && ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax})".format(xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
    with engine.connect() as connection:
        return (connection
            .execute("""SELECT row_to_json(fc)
                FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                    FROM (SELECT 'Feature' As type
                            , ST_AsGeoJSON(lg.wkb_geometry)::json As geometry
                            , row_to_json(lp) As properties
                    FROM busstops As lg
                        INNER JOIN (SELECT ogc_fid, onstreet, atstreet, stopname, tr_dir as trip_direction, point_x, point_y, srvd_rts, srvd_rts_o, globalid, bsi_id FROM busstops)
                        As lp
                        ON lg.ogc_fid = lp.ogc_fid
                                {bounds_clause} {limit_clause})
                        As f )
                        As fc; """.format(limit_clause=limit_clause, bounds_clause=bounds_clause))
            .fetchone()[0])

def bike(engine, limit=None, bounds=None):
    limit_clause = ""
    bounds_clause = ""
    if limit is not None:
        limit_clause = "limit {limit}".format(limit=int(limit))
    if bounds is not None:
        xmin, ymin, xmax, ymax = map(float, bounds)
        bounds_clause = "WHERE lg.wkb_geometry && ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax})".format(xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
    with engine.connect() as connection:
        return (connection
            .execute("""SELECT row_to_json(fc)
                        FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                        FROM (SELECT 'Feature' As type
                            , ST_AsGeoJSON(lg.wkb_geometry)::json As geometry
                            , row_to_json(lp) As properties
                        FROM bike As lg
                        INNER JOIN (SELECT *
                            FROM bike) As lp
                        ON lg.ogc_fid = lp.ogc_fid
                                {bounds_clause} {limit_clause})
                        As f )
                        As fc; """.format(limit_clause=limit_clause, bounds_clause=bounds_clause))
            .fetchone()[0])

def busroutes(engine, limit=None, bounds=None):
    limit_clause = ""
    bounds_clause = ""
    if limit is not None:
        limit_clause = "limit {limit}".format(limit=int(limit))
    if bounds is not None:
        xmin, ymin, xmax, ymax = map(float, bounds)
        bounds_clause = "WHERE lg.wkb_geometry && ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax})".format(xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax)
    with engine.connect() as connection:
        return (connection
            .execute("""SELECT row_to_json(fc)
                        FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                        FROM (SELECT 'Feature' As type
                            , ST_AsGeoJSON(lg.wkb_geometry)::json As geometry
                            , row_to_json(lp) As properties
                        FROM busroutes As lg
                        INNER JOIN (SELECT *
                            FROM busroutes) As lp
                        ON lg.id = lp.id
                        {bounds_clause} {limit_clause})
                        As f )
                        As fc; """.format(limit_clause=limit_clause, bounds_clause=bounds_clause))
            .fetchone()[0])