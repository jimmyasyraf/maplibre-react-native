import { NativeModules } from "react-native";

import LocationManager, {
  LocationModuleEventEmitter,
} from "../../../src/modules/location/locationManager";

const MapLibreRN = NativeModules.MLRNModule;
const MLRNLocationModule = NativeModules.MLRNLocationModule;

const location = {
  coords: {
    accuracy: 9.977999687194824,
    altitude: 44.64373779296875,
    heading: 251.5358428955078,
    latitude: 51.5462244,
    longitude: 4.1036916,
    speed: 0.08543474227190018,
  },
  timestamp: 1573730357879,
};

describe("LocationManager", () => {
  const locationManager = LocationManager;
  describe("constructor", () => {
    test("initializes locationManager correctly", () => {
      expect(locationManager._listeners).toStrictEqual([]);
      expect(locationManager._lastKnownLocation).toStrictEqual(null);
      expect(locationManager._isListening).toStrictEqual(false);
    });
  });

  describe("methods", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("#getLastKnownLocation", () => {
      test("gets last known location from native locationManager if non available", async () => {
        jest
          .spyOn(MLRNLocationModule, "getLastKnownLocation")
          .mockImplementation(() => location);

        const lastKnownLocation = await locationManager.getLastKnownLocation();

        expect(lastKnownLocation).toStrictEqual(location);
        expect(locationManager._lastKnownLocation).toStrictEqual(location);
        expect(MLRNLocationModule.getLastKnownLocation).toHaveBeenCalledTimes(
          1,
        );

        locationManager._lastKnownLocation = null;
      });

      test("returns cached location if available", async () => {
        locationManager._lastKnownLocation = location;

        await locationManager.getLastKnownLocation();

        expect(locationManager._lastKnownLocation).toStrictEqual(location);

        expect(MLRNLocationModule.getLastKnownLocation).not.toHaveBeenCalled();

        // reset
        locationManager._lastKnownLocation = null;
      });
    });

    describe("#addListener", () => {
      const myListener = jest.fn();
      MapLibreRN.LocationCallbackName = { Update: "MapboxUserLocationUpdate" };

      afterEach(() => {
        locationManager._listeners = [];
      });

      test("adds the listener", () => {
        expect(locationManager._listeners).toStrictEqual([]);
        locationManager.addListener(myListener);
        expect(locationManager._listeners).toStrictEqual([myListener]);
      });

      test("does not re-add same listener", () => {
        locationManager.addListener(myListener);
        expect(locationManager._listeners).toStrictEqual([myListener]);
        locationManager.addListener(myListener);
        expect(locationManager._listeners).toStrictEqual([myListener]);
        expect(myListener).not.toHaveBeenCalled();
      });

      test('calls listener with "lastKnownLocation"', () => {
        locationManager._lastKnownLocation = location;

        locationManager.addListener(myListener);
        expect(locationManager._listeners).toStrictEqual([myListener]);
        expect(myListener).toHaveBeenCalledWith(location);
        expect(myListener).toHaveBeenCalledTimes(1);
      });
    });

    describe("#removeListener", () => {
      MLRNLocationModule.stop = jest.fn();

      test("removes selected listener", () => {
        // just two different functions
        const listenerA = jest.fn(() => "listenerA");
        const listenerB = () => "listenerB";

        locationManager.addListener(listenerA);
        expect(locationManager._listeners).toStrictEqual([listenerA]);
        expect(MLRNLocationModule.stop).not.toHaveBeenCalled();

        locationManager.addListener(listenerB);
        expect(locationManager._listeners).toStrictEqual([
          listenerA,
          listenerB,
        ]);
        expect(MLRNLocationModule.stop).not.toHaveBeenCalled();

        locationManager.removeListener(listenerB);
        expect(locationManager._listeners).toStrictEqual([listenerA]);
        expect(MLRNLocationModule.stop).not.toHaveBeenCalled();

        locationManager.removeListener(listenerA);
        expect(locationManager._listeners).toStrictEqual([]);
        expect(MLRNLocationModule.stop).toHaveBeenCalledTimes(1);
      });
    });

    describe("#removeAllListeners", () => {
      test("removes all listeners", () => {
        // just two different functions
        const listenerA = jest.fn(() => "listenerA");
        const listenerB = () => "listenerB";

        locationManager.addListener(listenerA);
        expect(locationManager._listeners).toStrictEqual([listenerA]);
        locationManager.addListener(listenerB);
        expect(locationManager._listeners).toStrictEqual([
          listenerA,
          listenerB,
        ]);

        locationManager.removeAllListeners();
        expect(locationManager._listeners).toStrictEqual([]);
      });
    });

    describe("#start", () => {
      jest.spyOn(MLRNLocationModule, "start");
      jest.spyOn(LocationModuleEventEmitter, "addListener");

      afterEach(() => {
        locationManager._isListening = false;
      });

      test("starts native location manager and adds event emitter listener", () => {
        MapLibreRN.LocationCallbackName = {
          Update: "MapboxUserLocationUpdate",
        };

        expect(locationManager._isListening).toStrictEqual(false);

        locationManager.start();

        expect(MLRNLocationModule.start).toHaveBeenCalledTimes(1);
        expect(LocationModuleEventEmitter.addListener).toHaveBeenCalledWith(
          MapLibreRN.LocationCallbackName.Update,
          locationManager.onUpdate,
        );

        expect(locationManager._isListening).toStrictEqual(true);
      });

      test('passes "displacement"', () => {
        locationManager.start(5); // displacement 5meters

        expect(MLRNLocationModule.start).toHaveBeenCalledTimes(1);
        expect(MLRNLocationModule.start).toHaveBeenCalledWith(5);
      });

      test("does not start when already listening", () => {
        // we're already listening
        locationManager._isListening = true;

        expect(locationManager._isListening).toStrictEqual(true);

        locationManager.start();

        expect(MLRNLocationModule.start).not.toHaveBeenCalled();
        expect(LocationModuleEventEmitter.addListener).not.toHaveBeenCalled();
      });
    });

    describe("#stop", () => {
      test("stops native location manager", () => {
        // set listening to true
        locationManager._isListening = true;

        // native location manager has no #stop exposed in tests?
        MLRNLocationModule.stop = jest.fn();
        MapLibreRN.LocationCallbackName = {
          Update: "MapboxUserLocationUpdate",
        };

        expect(locationManager._isListening).toStrictEqual(true);

        locationManager.stop();

        expect(MLRNLocationModule.stop).toHaveBeenCalledTimes(1);
        expect(locationManager.subscription.remove).toHaveBeenCalled();

        expect(locationManager._isListening).toStrictEqual(false);
      });

      test("only removes event emitter listener when listening", () => {
        // set listening to true
        locationManager._isListening = false;

        // native location manager has no #stop exposed in tests?
        MLRNLocationModule.stop = jest.fn();
        MapLibreRN.LocationCallbackName = {
          Update: "MapboxUserLocationUpdate",
        };

        expect(locationManager._isListening).toStrictEqual(false);

        locationManager.stop();

        expect(MLRNLocationModule.stop).toHaveBeenCalledTimes(1);
        expect(locationManager.subscription.remove).not.toHaveBeenCalled();
      });
    });

    describe("#setMinDisplacement", () => {
      test('calls native "setMinDisplacement"', () => {
        MLRNLocationModule.setMinDisplacement = jest.fn();
        locationManager.setMinDisplacement(5);
        expect(MLRNLocationModule.setMinDisplacement).toHaveBeenCalledWith(5);
      });
    });

    describe("#onUpdate", () => {
      beforeEach(() => {
        locationManager._lastKnownLocation = null;
      });

      test('sets "_lastKnownLocation"', () => {
        locationManager.onUpdate(location);

        expect(locationManager._lastKnownLocation).toStrictEqual(location);
      });

      test("calls listeners with location", () => {
        const listeners = [jest.fn(), jest.fn(), jest.fn()];

        listeners.forEach((listener) => {
          locationManager.addListener(listener);
        });

        locationManager.onUpdate(location);

        listeners.forEach((listener) => {
          expect(listener).toHaveBeenCalledTimes(1);
          expect(listener).toHaveBeenCalledWith(location);
        });
      });
    });
  });
});
