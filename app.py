from flask import Flask, render_template
import os
from main import app

# Make sure to have in your .env file, the following:
# source env/bin/activate
# Then
# export APP_SETTINGS="config.DevelopmentConfig"
# Run the following to update then refresh your .bashrc:
# $ echo "source `which activate.sh`" >> ~/.bashrc
# $ source ~/.bashrc
# from models import Result


def main():

    @app.route('/', methods=('GET', 'POST'))
    def hello():
        return render_template('index.html')


    @app.route('/<name>')
    def hello_name(name):
        return "Hello {}!".format(name)

    app.run(port=5000, debug=True)


if __name__ == '__main__':
    main()