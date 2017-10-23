from flask import Flask, render_template
import requests
import json


app = Flask(__name__)


@app.route('/', methods=('GET', 'POST'))
def hello():
    return render_template('index.html')


if __name__ == "__main__":
    app.run('0.0.0.0', port=5000, debug=True)
