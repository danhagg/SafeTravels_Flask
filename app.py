from flask import Flask, render_template, request
import os
import db
import json

# Make sure to source the .env file
# hint:
# source .env

PORT = int(os.environ.get('PORT', '5000'))


def main():
    app = Flask(__name__)
    app.config.from_object(os.environ['APP_SETTINGS'])
    engine = db.create_engine(app.config)

    @app.route('/', methods=('GET', 'POST'))
    def hello():
        return render_template('index.html')

    @app.route('/crimes')
    def crimes():
        minx = request.args.get('minx')
        miny = request.args.get('miny')
        maxx = request.args.get('maxx')
        maxy = request.args.get('maxy')
        bounds = None
        if minx is not None or miny is not None or maxx is not None or maxy is not None:
            if minx is None or miny is None or maxx is None or maxy is None:
                raise ValueError("Incomplete bounds")
            bounds = (minx, miny, maxx, maxy)
        results = db.crimes(engine, limit=50, bounds=bounds)
        if results.get("features") is None:
            results["features"] = []
        return json.dumps(results)

    @app.route('/busstops')
    def busstops():
        minx = request.args.get('minx')
        miny = request.args.get('miny')
        maxx = request.args.get('maxx')
        maxy = request.args.get('maxy')
        bounds = None
        if minx is not None or miny is not None or maxx is not None or maxy is not None:
            if minx is None or miny is None or maxx is None or maxy is None:
                raise ValueError("Incomplete bounds")
            bounds = (minx, miny, maxx, maxy)
        results = db.busstops(engine, limit=50, bounds=bounds)
        if results.get("features") is None:
            results["features"] = []
        return json.dumps(results)

    @app.route('/bike')
    def bike():
        minx = request.args.get('minx')
        miny = request.args.get('miny')
        maxx = request.args.get('maxx')
        maxy = request.args.get('maxy')
        bounds = None
        if minx is not None or miny is not None or maxx is not None or maxy is not None:
            if minx is None or miny is None or maxx is None or maxy is None:
                raise ValueError("Incomplete bounds")
            bounds = (minx, miny, maxx, maxy)
        results = db.busstops(engine, limit=50, bounds=bounds)
        if results.get("features") is None:
            results["features"] = []
        return json.dumps(results)


    @app.route('/busroutes')
    def busroutes():
        minx = request.args.get('minx')
        miny = request.args.get('miny')
        maxx = request.args.get('maxx')
        maxy = request.args.get('maxy')
        bounds = None
        if minx is not None or miny is not None or maxx is not None or maxy is not None:
            if minx is None or miny is None or maxx is None or maxy is None:
                raise ValueError("Incomplete bounds")
            bounds = (minx, miny, maxx, maxy)
        results = db.busstops(engine, limit=50, bounds=bounds)

        if results.get("features") is None:
            results["features"] = []
        return json.dumps(results)



    app.run(host='0.0.0.0', port=PORT, debug=True)


if __name__ == '__main__':
    main()
