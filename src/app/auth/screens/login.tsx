import React, { useEffect } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	ImageBackground,
	Image,
	View as RNView,
} from "react-native";
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
						await AsyncStorage.setItem("token", tokenData.access_token);

						if (tokenData.expires_in) {
							const expiration = Date.now() + tokenData.expires_in * 1000;

							if (expiration < Date.now()) {
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

			{/* Achar uma boa imagem para a parte de cima */}

			{/* <ImageBackground
        		source={require("@/src/common/assets/images/login-bg.png")} 
        		style={styles.imageBackground}
        		resizeMode="cover"
      		>
        		<RNView style={styles.overlay} />
      		</ImageBackground> */}

			<View style={styles.loginContent}>
				<Image
					source={require("@/src/common/assets/images/spotifind-logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>

				<Text style={styles.subtitle}>
					Milhões de musícas e artistas {'\n'}para você escolher e escutar
				</Text>

				<TouchableOpacity style={styles.spotifyButton} onPress={() => promptAsync()}>
					<Text style={styles.spotifyButtonText}>Entrar com Spotify</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},

	imageBackground: {
		height: "45%",
		width: "100%",
	},

	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.4)",
	},

	loginContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 30,
		backgroundColor: "#000",
	  },
	  

	logo: {
		width: 80,
		height: 80,
		marginTop: -40,
		marginBottom: 24,
	},

	subtitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
		marginBottom: 32,
	},

	spotifyButton: {
		backgroundColor: "#1DB954",
		paddingVertical: 14,
		paddingHorizontal: 36,
		borderRadius: 30,
	},

	spotifyButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
