import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Error boundary wrapper for page-level crashes.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Something went wrong</p>
            <p className="text-sm text-slate-500">Please refresh the page or try again.</p>
          </div>
          <Button onClick={this.handleReset}>Try Again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
};
