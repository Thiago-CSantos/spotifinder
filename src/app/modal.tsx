import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/src/common/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyUserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
  uri: string;
}

export default function TabOneScreen() {
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Erro ao carregar perfil do Spotify.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={{ uri: userProfile.images?.[0]?.url }}
      />
      <Text style={styles.name}>{userProfile.display_name}</Text>
      <Text style={styles.email}>{userProfile.email}</Text>
      <Text style={styles.followers}>
        Seguidores: {userProfile.followers.total}
      </Text>
      <TouchableOpacity
        style={styles.spotifyButton}
        onPress={() => Linking.openURL(userProfile.external_urls.spotify)}
      >
        <Text style={styles.buttonText}>Ver no Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#1DB954",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  email: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 4,
  },
  followers: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
  spotifyButton: {
    marginTop: 24,
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
