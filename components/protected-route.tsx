import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute wrapper ensures only authenticated users can access the content.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();
  const colors = useAppColors();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login' as any);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
