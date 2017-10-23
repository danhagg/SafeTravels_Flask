from flask import Flask, render_template
import os
import db
import json

# Make sure to source the .env file
# hint:
# source .env

def main():
    app = Flask(__name__)
    app.config.from_object(os.environ['APP_SETTINGS'])
    engine = db.create_engine(app.config)

    @app.route('/', methods=('GET', 'POST'))
    def hello():
        return render_template('index.html')


    @app.route('/crimes')
    def crimes():
        results = db.crimes(engine, limit=10)
        return json.dumps(results)

    app.run(port=5000, debug=True)


if __name__ == '__main__':
    main()