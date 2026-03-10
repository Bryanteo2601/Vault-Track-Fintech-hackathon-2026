import { Redirect } from "expo-router";

// Redirect to dashboard (skip landing page)
export default function IndexRedirect() {
  return <Redirect href="/(tabs)" />;
}
