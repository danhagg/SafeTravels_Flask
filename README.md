# transport-app

Safe travels is a Flask-based map-oriented website for people who wish to travel through Houston, Texas, USA safely.

It employs the Google maps API, the walkscore API (https://www.walkscore.com/)

It also pulls data from Houston Geographic Information Service on local
1. Bikeways
2. Bus Routes
3. Monthly crime data
        
This data is stored a postgresql with postGIS extensions to handle the data

SQLAlchemy is the ORM between our sql database and our flask app

