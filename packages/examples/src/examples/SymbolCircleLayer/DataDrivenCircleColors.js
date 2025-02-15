import MapLibreGL from "@maplibre/maplibre-react-native";
import React from "react";

import sheet from "../../styles/sheet";
import Page from "../common/Page";

const styles = {
  circles: {
    circleRadius: [
      "interpolate",
      ["exponential", 1.75],
      ["zoom"],
      12,
      2,
      22,
      180,
    ],

    circleColor: [
      "match",
      ["get", "ethnicity"],
      "White",
      "#fbb03b",
      "Black",
      "#223b53",
      "Hispanic",
      "#e55e5e",
      "Asian",
      "#3bb2d0",
      /* other */ "#ccc",
    ],
  },
};

function DataDrivenCircleColors() {
  return (
    <Page>
      <MapLibreGL.MapView
        styleURL={MapLibreGL.StyleURL.Default}
        style={sheet.matchParent}
      >
        <MapLibreGL.Camera
          zoomLevel={10}
          pitch={45}
          centerCoordinate={[-122.400021, 37.789085]}
        />

        <MapLibreGL.VectorSource
          id="population"
          url="mapbox://examples.8fgz4egr"
        >
          <MapLibreGL.CircleLayer
            id="sf2010CircleFill"
            sourceLayerID="sf2010"
            style={styles.circles}
          />
        </MapLibreGL.VectorSource>
      </MapLibreGL.MapView>
    </Page>
  );
}

export default React.memo(DataDrivenCircleColors);
