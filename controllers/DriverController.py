from services import driverService

class DriverController:
    def __init__(self):
        # self.driverModel = driverModel
        self.driverService = driverService.DriverService()

    def registerDriver(self,model, body):
        resp = self.driverService.getDrivers(model)
        print(resp)
        return resp