"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Bug, ExternalLink, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AIAssistantErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("AI Assistant Error:", error);
      console.error("Error Info:", errorInfo);
    }

    // You can also log the error to an error reporting service here
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen items-center justify-center bg-muted p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Something went wrong
                  </CardTitle>
                  <CardDescription>
                    The AI Assistant encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong>{" "}
                  {this.state.error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Try refreshing the page</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                  <li>• Try again in a few minutes</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="mt-4 p-3 bg-gray-100 rounded-md">
                    <summary className="cursor-pointer text-sm font-medium mb-2">
                      Developer Details
                    </summary>
                    <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.error?.stack}
                    </pre>
                    <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap mt-2">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
