'use client';

import React, { Component, ReactNode } from 'react';
import { Alert, Button, Stack, Text, Code, Collapse } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconBug } from '@tabler/icons-react';
import { apiClientInstance } from '@/lib/apiClient';
import { notifications } from '@mantine/notifications';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error('API Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Check if this is an API-related error and potentially switch to mock services
    if (this.isApiError(error)) {
      this.handleApiError(error);
    }
  }

  private isApiError(error: Error): boolean {
    const apiErrorIndicators = [
      'fetch',
      'network',
      'api',
      'server',
      'connection',
      'timeout',
      'cors',
    ];

    const errorMessage = error.message.toLowerCase();
    return apiErrorIndicators.some(indicator =>
      errorMessage.includes(indicator)
    );
  }

  private handleApiError(error: Error) {
    // If using real API and it fails, offer to switch to mock
    if (apiClientInstance.isUsingRealApi) {
      notifications.show({
        title: 'API Error Detected',
        message: 'Would you like to switch to mock services?',
        color: 'red',
        autoClose: false,
        withCloseButton: true,
        action: (
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              apiClientInstance.setApiMode(false);
              this.handleRetry();
              notifications.clean();
            }}
          >
            Switch to Mock
          </Button>
        ),
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Something went wrong"
          color="red"
          variant="light"
          style={{ margin: '1rem' }}
        >
          <Stack gap="md">
            <Text size="sm">
              An error occurred while loading this component. This might be due
              to a network issue or server problem.
            </Text>

            {apiClientInstance.isUsingRealApi && (
              <Text size="sm" c="dimmed">
                You're currently using real API services. You can switch to mock
                services as a fallback.
              </Text>
            )}

            <Stack gap="xs">
              <Button
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleRetry}
                variant="light"
              >
                Try Again
              </Button>

              {apiClientInstance.isUsingRealApi && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    apiClientInstance.setApiMode(false);
                    this.handleRetry();
                  }}
                >
                  Switch to Mock Services
                </Button>
              )}

              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconBug size={14} />}
                onClick={this.toggleDetails}
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Error Details
              </Button>
            </Stack>

            <Collapse in={this.state.showDetails}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Error Details:
                </Text>
                <Code block>
                  {this.state.error?.message || 'Unknown error'}
                </Code>
                {this.state.error?.stack && (
                  <>
                    <Text size="sm" fw={500}>
                      Stack Trace:
                    </Text>
                    <Code
                      block
                      style={{
                        fontSize: '0.75rem',
                        maxHeight: '200px',
                        overflow: 'auto',
                      }}
                    >
                      {this.state.error.stack}
                    </Code>
                  </>
                )}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <Text size="sm" fw={500}>
                      Component Stack:
                    </Text>
                    <Code
                      block
                      style={{
                        fontSize: '0.75rem',
                        maxHeight: '200px',
                        overflow: 'auto',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Code>
                  </>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ApiErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ApiErrorBoundary>
  );

  WrappedComponent.displayName = `withApiErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
