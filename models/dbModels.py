from app import db


class Drivers(db.Model):
    __tablename__ = "DriverInfo"
    Id = db.Column('Id',db.Unicode, primary_key=True)
    Name = db.Column('Name', db.String(50))
    Age = db.Column('Age', db.String(50))


