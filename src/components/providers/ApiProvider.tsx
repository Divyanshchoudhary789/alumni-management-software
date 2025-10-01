'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { apiClientInstance, initializeApiClient } from '@/lib/apiClient';
import { notifications } from '@mantine/notifications';
import { Loader, Center, Stack, Text, Button, Alert } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ApiContextType {
  isInitialized: boolean;
  isUsingRealApi: boolean;
  isBackendHealthy: boolean;
  switchToMockApi: () => void;
  switchToRealApi: () => void;
  checkBackendHealth: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}

interface ApiProviderProps {
  children: ReactNode;
  showLoadingScreen?: boolean;
}

export function ApiProvider({
  children,
  showLoadingScreen = true,
}: ApiProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUsingRealApi, setIsUsingRealApi] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const [isRetrying, setIsRetrying] = useState(false);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await apiClientInstance.checkBackendHealth();
      setIsBackendHealthy(isHealthy);
      return isHealthy;
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsBackendHealthy(false);
      return false;
    }
  };

  const initializeApi = async () => {
    try {
      setInitializationError(null);
      await initializeApiClient();

      const isHealthy = await checkBackendHealth();
      setIsUsingRealApi(apiClientInstance.isUsingRealApi);
      setIsBackendHealthy(isHealthy);

      if (!isHealthy && process.env.NEXT_PUBLIC_USE_REAL_API === 'true') {
        notifications.show({
          title: 'Backend Unavailable',
          message: 'Using mock services as fallback',
          color: 'yellow',
          autoClose: 5000,
        });
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('API initialization failed:', error);
      setInitializationError(
        error instanceof Error ? error.message : 'Failed to initialize API'
      );

      // Fall back to mock services
      apiClientInstance.setApiMode(false);
      setIsUsingRealApi(false);
      setIsBackendHealthy(false);
      setIsInitialized(true);

      notifications.show({
        title: 'API Initialization Failed',
        message: 'Using mock services as fallback',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const retryInitialization = async () => {
    setIsRetrying(true);
    await initializeApi();
    setIsRetrying(false);
  };

  const switchToMockApi = () => {
    apiClientInstance.setApiMode(false);
    setIsUsingRealApi(false);
    notifications.show({
      title: 'Switched to Mock API',
      message: 'Now using mock services for all API calls',
      color: 'orange',
    });
  };

  const switchToRealApi = async () => {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      apiClientInstance.setApiMode(true);
      setIsUsingRealApi(true);
      notifications.show({
        title: 'Switched to Real API',
        message: 'Now using real backend services',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Backend Unavailable',
        message: 'Cannot switch to real API - backend is not healthy',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    initializeApi();
  }, []);

  const contextValue: ApiContextType = {
    isInitialized,
    isUsingRealApi,
    isBackendHealthy,
    switchToMockApi,
    switchToRealApi,
    checkBackendHealth,
  };

  // Show loading screen during initialization if enabled
  if (!isInitialized && showLoadingScreen) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="lg" fw={500}>
            Initializing Application...
          </Text>
          <Text size="sm" c="dimmed">
            Setting up API connections
          </Text>

          {initializationError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Initialization Error"
              color="red"
              style={{ maxWidth: 400 }}
            >
              <Stack gap="sm">
                <Text size="sm">{initializationError}</Text>
                <Button
                  size="sm"
                  variant="light"
                  leftSection={<IconRefresh size={16} />}
                  onClick={retryInitialization}
                  loading={isRetrying}
                >
                  Retry
                </Button>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Center>
    );
  }

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
}

// Hook to get API status information
export function useApiStatus() {
  const context = useApiContext();
  return {
    isUsingRealApi: context.isUsingRealApi,
    isBackendHealthy: context.isBackendHealthy,
    canSwitchToRealApi: context.isBackendHealthy,
    switchToMockApi: context.switchToMockApi,
    switchToRealApi: context.switchToRealApi,
    checkBackendHealth: context.checkBackendHealth,
  };
}
