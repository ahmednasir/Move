import redis
from flask import Flask, render_template, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
import datetime as dt
from flask_sqlalchemy import SQLAlchemy
import uuid
import json

from controllers import DriverController

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = '=CCp6+H(&ey[).R5xbV4YYxYr[B'
app.config['SQLALCHEMY_DATABASE_URI']="mysql+pymysql://root:@127.0.0.1:3306/CabBook"
app.config['SQLALCHEMY_ECHO'] = True
db = SQLAlchemy(app)

socketio = SocketIO(app)
redisClient = redis.Redis()

# ---------------------- models----------------------

class Drivers(db.Model):
    __tablename__ = "DriverInfo"
    Id =        db.Column('Id',db.Unicode, primary_key=True)
    Name =      db.Column('Name', db.String(50))
    Age =       db.Column('Age', db.Integer)
    Password =  db.Column('Password', db.String(50))

class Passenger(db.Model):
    __tablename__ = "PassengerInfo"
    Id =            db.Column('Id', db.Unicode, primary_key=True)
    Name =          db.Column('Name', db.String(50))
    PhoneNumber =   db.Column('PhoneNumber', db.Integer)
    Password =      db.Column('Password', db.String(50))

class Rides(db.Model):
    __tablename__ = "Rides"
    Id =            db.Column('Id', db.Unicode, primary_key=True)
    From =          db.Column('From', db.String(50))
    To =            db.Column('To', db.String(50))
    PassengerId =   db.Column('PassengerId', db.String(50))
    DriverId =      db.Column('DriverId', db.String(50))
    StartedOn =     db.Column('StartedOn', db.DateTime)
    ExpiredOn =     db.Column('ExpiredOn', db.DateTime)
    Status =        db.Column('Status', db.String(50))


# ---------------------- models----------------------

# ----------------------APIs-------------------------
@app.route('/')
def hello():
    return "Hello World"

@app.route('/<userType>')
def index(userType):
    if userType.lower() == 'passenger':
        return render_template("passenger-sign-in.html")
    elif userType.lower() == 'driver':
        return render_template("driver-sign-in.html")
    else:
        return "<h1>404</h1>"

@app.route('/register/driver', methods=["POST"])
def driverRegister():
    try:
        id = uuid.uuid1().hex
        name = request.json.get("Name")
        age = request.json.get("Age")
        driver = Drivers(Id=id, Name=name, Age=age)
        db.session.add(driver)
        db.session.commit()
        return app.response_class(
            response=json.dumps({"Status":200, "Message":"ok", "Token":id}),
            status=200,
            mimetype='application/json'
        )
    except Exception as ex:
        print(ex)
        return app.response_class(
            response=json.dumps({}),
            status=500,
            mimetype='application/json'
        )


@app.route('/register/passenger', methods=["POST"])
def passengerRegister():
    try:
        id = uuid.uuid1().hex
        name = request.json.get("Name")
        phone = request.json.get("PhoneNumber")
        passenger = Passenger(Id=id, Name=name, PhoneNumber=phone)
        db.session.add(passenger)
        db.session.commit()
        return app.response_class(
            response=json.dumps({"Status":200, "Message":"ok", "Token":id}),
            status=200,
            mimetype='application/json'
        )
    except Exception as ex:
        print(ex)
        return app.response_class(
            response=json.dumps({}),
            status=500,
            mimetype='application/json'
        )


@app.route('/driver', methods=["POST"])
def driverTemplate():
    try:
        name = request.form["username"]
        password =  request.form["password"]

        resp = Drivers.query.filter_by(Name=name, Password=password).first()
        if resp:
            return render_template("driver.html", id=resp.Id)
        else:
            return '<h1>401</h1>'
    except Exception as ex:
        print(ex)
        return '<h1>500</h1>'

@app.route('/user')
def userTemplate():
    return render_template("user.html", id= uuid.uuid1().hex)


# ----------------------APIs-------------------------


# ----------------------Sockets-------------------------

@socketio.on('myevent')
def handle_my_custom_event(json):
    print('received json: ' + str(json))

@socketio.on('bookRequest')
def bookingRequest(req):
    try:
        socketId = request.sid
        print(socketId)
        '''{'data': {'Id': '59b5d960920611eaacafd0817ac7cd16', 'PickUpInfo': {'lat': 12.9224929, 'lng': 77.6362169,
                                                                           'Address': "257, 5th Cross Rd, Teacher's Colony, Jakkasandra, 1st Block Koramangala, Koramangala, Bengaluru, Karnataka 560034, India"},
                  'DropInfo': {'lat': 12.9192964, 'lng': 77.63494779999999,
                               'Address': "114, 8th D Cross Rd, Teacher's Colony, Jakkasandra, 1st Block Koramangala, Koramangala, Bengaluru, Karnataka 560034, India"},
                  'Name': 'Nasir'}}'''
        print('received json: ' + str(req))

        rideInfo = Rides(Id=uuid.uuid1().hex,
                         From= json.dumps(req["data"]["PickUpInfo"]),
                         To=json.dumps(req["data"]["DropInfo"]),
                         PassengerId=req["data"]["Id"],
                         DriverId= "",
                         StartedOn= dt.datetime.now(),
                         ExpiredOn=dt.datetime.now(),
                         Status= "pending"
                         )
        db.session.add(rideInfo)
        db.session.commit()
        req["data"]["ClientId"] = socketId
        emit('bookRequest', req, broadcast=True)
    except Exception as ex:
        print(ex)


@socketio.on('accepted')
def bookingRequest(req):
    socketId = req["Request"]["ClientId"]
    socketio.emit("acceptedRequest", req,room=socketId)
    print('received json: ' + str(req))

@socketio.on("location")
def getLocation(req):
    print(req)

# ----------------------Sockets-------------------------


if __name__ == '__main__':
    driverController = DriverController.DriverController()
    print("Running....")
    socketio.run(app,host="0.0.0.0", port=5000)
