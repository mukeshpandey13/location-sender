import { Image, StyleSheet, Platform, Text, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API_ROUTE = "https://webhook.site/00c8c346-a12e-4844-b49b-20a76a4de7a6"; 
  const LOCATION_UPDATE_INTERVAL = 10000; // Interval in milliseconds (10s default)

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      sendLocationToApi(location);
    }

    async function sendLocationToApi(location: Location.LocationObject) {
      try {
        await fetch(API_ROUTE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        });
      } catch (error) {
        console.error("Error sending location:", error);
      }
    }

    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, LOCATION_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedText>Current Location: {text}</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
