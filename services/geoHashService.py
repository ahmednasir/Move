import Geohash
from Geohash import geohash

class GeoHashService:
    def hashCoordinates(self, coordinates):
        print(coordinates)

    def storeAndHash(self,coordinates):
        Geohash.encode(coordinates["lat"], coordinates["lng"],precision=5)

