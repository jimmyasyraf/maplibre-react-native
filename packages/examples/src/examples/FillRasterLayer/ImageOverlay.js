import MapLibreGL from "@maplibre/maplibre-react-native";
import React from "react";
import { Text } from "react-native";

import radar0 from "../../assets/radar.png";
import radar1 from "../../assets/radar1.png";
import radar2 from "../../assets/radar2.png";
import sheet from "../../styles/sheet";
import Bubble from "../common/Bubble";
import Page from "../common/Page";

const styles = {
  rasterLayer: { rasterOpacity: 0.6 },
  bubble: { bottom: 100 },
};

const frames = [radar0, radar1, radar2];
const coordQuads = [
  [
    [-80.425, 46.437], // top left
    [-71.516, 46.437], // top right
    [-71.516, 37.936], // bottom right
    [-80.425, 37.936], // bottom left
  ],
  [
    [-85.425, 45.437], // top left
    [-75.516, 45.437], // top right
    [-75.516, 36.936], // bottom right
    [-85.425, 36.936], // bottom left
  ],
];

class ImageOverlay extends React.Component {
  state = {
    radarFrameIndex: 0,
    coords: coordQuads[0],
    dynamic: false,
  };

  _timeout = null;

  componentDidMount() {
    this.heartbeat();
  }

  heartbeat() {
    this._timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        let nextFrame = this.state.radarFrameIndex + 1;
        if (nextFrame > 1) {
          nextFrame = 0;
        }

        if (this.state.dynamic) {
          this.setState({
            radarFrameIndex: nextFrame,
            coords: coordQuads[nextFrame],
          });
        } else {
          this.setState({ radarFrameIndex: nextFrame });
        }
        this.heartbeat();
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const bubbleText = this.state.dynamic
      ? "Static coordinates"
      : "Dynamic coordinates";
    return (
      <Page>
        <MapLibreGL.MapView
          ref={(ref) => (this.map = ref)}
          style={sheet.matchParent}
          styleURL={MapLibreGL.StyleURL.Default}
        >
          <MapLibreGL.Camera zoomLevel={4} centerCoordinate={[-79, 40]} />

          <MapLibreGL.Animated.ImageSource
            key="d"
            id="radarSource"
            coordinates={this.state.coords}
            url={frames[this.state.radarFrameIndex]}
          >
            <MapLibreGL.RasterLayer
              id="radarLayer"
              style={styles.rasterLayer}
            />
          </MapLibreGL.Animated.ImageSource>
        </MapLibreGL.MapView>
        <Bubble
          onPress={() => {
            this.setState((prevState) => ({ dynamic: !prevState.dynamic }));
          }}
          style={styles.bubble}
        >
          <Text>{bubbleText}</Text>
        </Bubble>
      </Page>
    );
  }
}

export default ImageOverlay;
