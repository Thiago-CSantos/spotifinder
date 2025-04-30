import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/src/common/components/Themed";
import * as AuthSession from "expo-auth-session";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Endpoints do Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const clientId = "05ef23cd1a804939bc1d1a5806982023";
const scopes = [
  "user-read-email",
  "user-library-read",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
];

// Cria a URL de redirecionamento
const redirectUri = AuthSession.makeRedirectUri({useProxy: true,});
console.log(`Redirect URI: ${redirectUri}`);

export default function Login() {
  const navigation = useNavigation();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success") {
        const { code } = response.params;

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: request?.codeVerifier || "",
        });

        try {
          const tokenResponse = await fetch(discovery.tokenEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });

          const tokenData = await tokenResponse.json();

          if (tokenData.access_token) {
            await AsyncStorage.setItem("token", tokenData.access_token);
            if (tokenData.expires_in) {
              const expiration = Date.now() + tokenData.expires_in * 1000;
              await AsyncStorage.setItem("expirationDate", expiration.toString());
            }
          }
        } catch (err) {
          console.error("Erro ao trocar código por token:", err);
        }
      }
    };

    handleAuth();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Spotifinder</Text>
      <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Entrar com Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
