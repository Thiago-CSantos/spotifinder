import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/src/common/components/Themed";
import * as AuthSession from "expo-auth-session";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack"; 

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

const redirectUri = AuthSession.makeRedirectUri({
  path: "/spotify-auth-callback",
});

type RootStackParamList = {
  "(tabs)": undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "(tabs)">;

export default function Login() {
  const navigation = useNavigation<NavigationProp>();

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
            console.log("entrou no if");
            await AsyncStorage.setItem("token", tokenData.access_token);

            if (tokenData.expires_in) {
              console.log("entrou no if 2");
              const expiration = Date.now() + tokenData.expires_in * 1000;

              if (expiration < Date.now()) {
                console.log("Token expirado");
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("expirationDate");
              }

              await AsyncStorage.setItem(
                "expirationDate",
                expiration.toString()
              );
              navigation.navigate("(tabs)");
            }
          } else {
            console.error("Erro ao obter token de acesso:", tokenData);
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
