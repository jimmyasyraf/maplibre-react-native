import MapLibreGL, {
  type SymbolLayerStyle,
} from "@maplibre/maplibre-react-native";
import { type ReactElement, useState } from "react";
import {
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import exampleIcon from "../../assets/pin.png";
import sheet from "../../styles/sheet";
import Page from "../common/Page";

const defaultCamera = {
  centerCoordinate: [12.338, 45.4385],
  zoomLevel: 17.4,
};

const featureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "9d10456e-bdda-4aa9-9269-04c1667d4552",
      properties: {
        icon: "example",
        message: "Hello!",
      },
      geometry: {
        type: "Point",
        coordinates: [12.338, 45.4385],
      },
    },
  ],
};

type CustomCalloutViewProps = {
  message: string;
};

const CustomCalloutView = ({ message }: CustomCalloutViewProps) => {
  return (
    <View style={styles.calloutContainerStyle}>
      <Text style={styles.customCalloutText}>{message}</Text>
    </View>
  );
};

type CustomCalloutProps = {
  label: string;
};

const CustomCallout = (props: CustomCalloutProps): ReactElement => {
  const [selectedFeature, setSelectedFeature] =
    useState<GeoJSON.Feature<GeoJSON.Point, { message: string }>>();

  const onPinPress = (e: any): void => {
    if (selectedFeature) {
      setSelectedFeature(undefined);
      return;
    }

    const feature = e?.features[0];
    setSelectedFeature(feature);
  };

  return (
    <Page {...props}>
      <MapLibreGL.MapView style={sheet.matchParent}>
        <MapLibreGL.Camera defaultSettings={defaultCamera} />
        <MapLibreGL.ShapeSource
          id="mapPinsSource"
          shape={featureCollection}
          onPress={onPinPress}
        >
          <MapLibreGL.SymbolLayer
            id="mapPinsLayer"
            style={styles.mapPinLayer}
          />
        </MapLibreGL.ShapeSource>
        {selectedFeature && (
          <MapLibreGL.MarkerView
            id="selectedFeatureMarkerView"
            coordinate={selectedFeature.geometry.coordinates}
          >
            <CustomCalloutView message={selectedFeature?.properties?.message} />
          </MapLibreGL.MarkerView>
        )}
      </MapLibreGL.MapView>
    </Page>
  );
};

interface CustomCalloutStyles {
  mapPinLayer: SymbolLayerStyle;
  customCalloutText: StyleProp<TextStyle>;
  calloutContainerStyle: StyleProp<ViewStyle>;
}

const styles: CustomCalloutStyles = {
  mapPinLayer: {
    iconAllowOverlap: true,
    iconAnchor: "bottom",
    iconSize: 1.0,
    iconImage: exampleIcon,
  },
  customCalloutText: {
    color: "black",
    fontSize: 16,
  },
  calloutContainerStyle: {
    backgroundColor: "white",
    width: 60,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default CustomCallout;
