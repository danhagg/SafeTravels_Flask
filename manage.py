#!/usr/bin/env python


import os
from flask_migrate import Manager
from flask_migrate import Migrate, MigrateCommand

from main import app
from models import db

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()