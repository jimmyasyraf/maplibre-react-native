import MapLibreGL from "@maplibre/maplibre-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import sheet from "../../styles/sheet";
import Page from "../common/Page";

const styles = StyleSheet.create({
  touchableContainer: {
    borderColor: "black",
    borderWidth: 1.0,
    width: 60,
  },
  touchable: {
    backgroundColor: "blue",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  touchableText: {
    color: "white",
    fontWeight: "bold",
  },
});

interface AnnotationContentProps {
  title: string;
}

function AnnotationContent({ title }: AnnotationContentProps) {
  return (
    <View style={styles.touchableContainer}>
      <Text>{title}</Text>
      <TouchableOpacity style={styles.touchable}>
        <Text style={styles.touchableText}>Btn</Text>
      </TouchableOpacity>
    </View>
  );
}

const COORDINATES = [
  [-73.99155, 40.73581],
  [-73.99155, 40.73681],
] as [GeoJSON.Position, GeoJSON.Position];

export default function MarkerView() {
  return (
    <Page>
      <MapLibreGL.MapView style={sheet.matchParent}>
        <MapLibreGL.Camera zoomLevel={16} centerCoordinate={COORDINATES[0]} />

        <MapLibreGL.PointAnnotation coordinate={COORDINATES[1]} id="pt-ann">
          <AnnotationContent title="this is a point annotation" />
        </MapLibreGL.PointAnnotation>

        <MapLibreGL.MarkerView coordinate={COORDINATES[0]}>
          <AnnotationContent title="this is a marker view" />
        </MapLibreGL.MarkerView>
      </MapLibreGL.MapView>
    </Page>
  );
}
