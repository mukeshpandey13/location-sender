import { Image, StyleSheet, Platform, Text, View, Button } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import React, { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import io, { Socket } from "socket.io-client";

export default function HomeScreen() {
  const socket = React.useRef<Socket | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const locationRef = useRef<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // const serverIP = '10.100.11.32:3000';
  const serverIP = "http://localhost:3000";
  const LOCATION_UPDATE_INTERVAL = 10000; // Interval in milliseconds (10s default)

  socket.current = io(serverIP);

  // Listen for messages from the server
  socket.current.on("message", (message) => {
    console.log(message);

    // setServerMessage(message);
  });

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      console.log("getting location");
      
      let tempLocation = await Location.getCurrentPositionAsync({});
      setLocation(tempLocation);
      console.log("tempLocation: ", tempLocation);
    }

    getCurrentLocation();
    const intervalId = setInterval(async () => {
      await getCurrentLocation();
      
    // bug here because sendLocation in setInterval causes it to inherit state from when first interval was called,
    // instead of reflecting state changes

    // fix: create ref just to reflect changes to state. update ref.current wiht useEffect for location state   
      sendLocation();
    }, LOCATION_UPDATE_INTERVAL);
    return () => {
      clearInterval(intervalId);
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect( () => {
    console.log("location changed: ", {location});
    locationRef.current = location;
  }, [location]);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const sendLocation = () => {
    if (socket.current) {
      console.log("location state when sending: ", location);
      console.log("location ref when sending: ", locationRef.current);

      socket.current.emit("message", JSON.stringify(locationRef.current));
      console.log("sent location");
      
    }
  };

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
