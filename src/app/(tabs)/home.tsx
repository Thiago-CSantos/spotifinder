import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  FlatList,
  View,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Track {
  track: {
    name: string;
    external_urls: { spotify: string };
    artists: {
      name: string;
      external_urls: { spotify: string };
    }[];
    album: {
      name: string;
      images: { url: string; height: number; width: number }[];
      external_urls: { spotify: string };
    };
  };
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const getRecentTracks = async () => {
    const accessToken = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=10",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setRecentTracks(data.items);
    } catch (error) {
      console.error("Erro ao buscar músicas recentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecentTracks();
  }, []);

  const renderItem = ({ item }: { item: Track }) => {
    const { album, name, artists, external_urls } = item.track;
    const albumImage = album.images[0]?.url;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL(external_urls.spotify)}
      >
        <Image source={{ uri: albumImage }} style={styles.albumImage} />
        <View style={styles.info}>
          <Text style={styles.trackName} numberOfLines={1}>{name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artists.map((a) => a.name).join(", ")}
          </Text>
          <Text style={styles.albumName} numberOfLines={1}>
            Álbum: {album.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.likedButton}
        onPress={() => navigation.navigate("liked" as never)}
      >
        <Text style={styles.likedButtonText}>❤️ Ver Músicas Curtidas</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ouvidos recentemente</Text>
      <FlatList
        data={recentTracks}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  likedButton: {
    backgroundColor: "#1DB954",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  likedButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  albumImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  artistName: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },
  albumName: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});
