import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LikedTrack {
  added_at: string;
  track: {
    name: string;
    external_urls: { spotify: string };
    artists: { name: string; external_urls: { spotify: string } }[];
    album: {
      name: string;
      images: { url: string; height: number; width: number }[];
      external_urls: { spotify: string };
    };
  };
}

export default function LikedScreen() {
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50;

  const getLikedTracks = async (newOffset: number) => {
    const accessToken = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/tracks?offset=${newOffset}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        setLikedTracks(prev => [...prev, ...data.items]);
        setOffset(prev => prev + LIMIT);
      }
      if (!data.next) setHasMore(false);
    } catch (error) {
      console.error("Erro ao buscar faixas curtidas:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    getLikedTracks(0);
  }, []);

  const loadMoreTracks = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      getLikedTracks(offset);
    }
  };

  const renderItem = ({ item }: { item: LikedTrack }) => {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Músicas Curtidas</Text>
      <FlatList
        data={likedTracks}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={loadMoreTracks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#1DB954" style={{ marginVertical: 10 }} />
          ) : null
        }
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
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
