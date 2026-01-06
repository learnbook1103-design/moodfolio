import React from 'react';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                문제가 발생했습니다
                            </h1>
                            <p className="text-gray-400 mb-6">
                                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 메인 페이지로 돌아가주세요.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left bg-gray-800 p-4 rounded-lg">
                                <summary className="cursor-pointer text-red-400 font-mono text-sm mb-2">
                                    에러 상세 정보 (개발 모드)
                                </summary>
                                <pre className="text-xs text-gray-300 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                                새로고침
                            </button>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                메인으로
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
