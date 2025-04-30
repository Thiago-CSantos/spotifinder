import React, { useEffect, useState } from "react";
import { StyleSheet, Image } from "react-native";
import EditScreenInfo from "@/src/common/components/EditScreenInfo";
import { Text, View } from "@/src/common/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyUserProfile {
  country: "string";
  display_name: "string";
  email: "string";
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: "string";
  };
  followers: {
    href: null;
    total: number;
  };
  href: "string";
  id: "string";
  images: SpotifyImage[];
  product: "string";
  type: "user";
  uri: "string";
}

export default function TabOneScreen() {
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile>();

  const getProfile = async () => {
    const accessToken = await AsyncStorage.getItem("token");
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      setUserProfile(data);
      return data;
    } catch (error) {
      console.error("Erro em fazer o fetching profile:", error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Image
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          resizeMode: "cover",
        }}
        source={{ uri: userProfile?.images[0].url }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
