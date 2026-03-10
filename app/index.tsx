import { Redirect } from "expo-router";

// Lightweight redirect: keep "/" as a route, but always send users to "/landing".
export default function IndexRedirect() {
  return <Redirect href="/landing" />;
}
