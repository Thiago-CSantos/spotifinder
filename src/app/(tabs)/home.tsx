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

// ...imports e interfaces iguais

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
        activeOpacity={0.8}
      >
        <Image source={{ uri: albumImage }} style={styles.albumImage} />
        <View style={styles.info}>
          <Text style={styles.trackName} numberOfLines={1}>{name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artists.map((a) => a.name).join(", ")}
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
        style={styles.card}
        onPress={() => navigation.navigate("liked" as never)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: "https://misc.scdn.co/liked-songs/liked-songs-640.png" }}
          style={styles.albumImage}
        />
        <View style={styles.info}>
          <Text style={styles.trackName}>Músicas Curtidas</Text>
          <Text style={styles.artistName}>Playlist</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Ouvidos recentemente</Text>
      <FlatList
        data={recentTracks}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
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
    paddingTop: 48,
  },
  title: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  albumImage: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: "#B3B3B3",
  },
});
