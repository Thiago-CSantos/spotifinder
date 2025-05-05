import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

export default function Index() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    navigation.replace("Login");
  }, [navigation]);

  return null;
}
