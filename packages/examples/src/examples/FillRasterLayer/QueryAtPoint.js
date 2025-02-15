import MapLibreGL from "@maplibre/maplibre-react-native";
import React from "react";
import { Text } from "react-native";

import nycJSON from "../../assets/nyc_geojson.json";
import sheet from "../../styles/sheet";
import Bubble from "../common/Bubble";
import Page from "../common/Page";

const styles = {
  neighborhoods: {
    fillAntialias: true,
    fillColor: "blue",
    fillOutlineColor: "black",
    fillOpacity: 0.84,
  },
  selectedNeighborhood: {
    fillAntialias: true,
    fillColor: "green",
    fillOpacity: 0.84,
  },
};

class QueryAtPoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.emptyState;
    this.onPress = this.onPress.bind(this);
  }

  get emptyState() {
    return { selectedGeoJSON: null, selectedCommunityDistrict: -1 };
  }

  async onPress(e) {
    const { screenPointX, screenPointY } = e.properties;

    const featureCollection = await this._map.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      null,
      ["nycFill"],
    );

    if (featureCollection.features.length) {
      this.setState({
        selectedGeoJSON: featureCollection,
        selectedCommunityDistrict:
          featureCollection.features[0].properties.communityDistrict,
      });
    } else {
      this.setState(this.emptyState);
    }
  }

  render() {
    return (
      <Page>
        <MapLibreGL.MapView
          ref={(c) => (this._map = c)}
          onPress={this.onPress}
          style={sheet.matchParent}
          styleURL={MapLibreGL.StyleURL.Default}
        >
          <MapLibreGL.Camera
            zoomLevel={9}
            centerCoordinate={[-73.970895, 40.723279]}
          />

          <MapLibreGL.ShapeSource id="nyc" shape={nycJSON}>
            <MapLibreGL.FillLayer id="nycFill" style={styles.neighborhoods} />
          </MapLibreGL.ShapeSource>

          {this.state.selectedGeoJSON ? (
            <MapLibreGL.ShapeSource
              id="selectedNYC"
              shape={this.state.selectedGeoJSON}
            >
              <MapLibreGL.FillLayer
                id="selectedNYCFill"
                style={styles.selectedNeighborhood}
              />
            </MapLibreGL.ShapeSource>
          ) : null}
        </MapLibreGL.MapView>

        <Bubble>
          <Text>Press on a feature to highlight it.</Text>
        </Bubble>
      </Page>
    );
  }
}

export default QueryAtPoint;
