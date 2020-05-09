

class DriverService:
    def __init__(self):
        pass


    def getDrivers(self,model):
        try:

            return model.query().all()
        except Exception as ex:
            print(ex)
            return False

