import { Component, type ReactNode } from 'react'

interface Props {
  onError: () => void
  children: ReactNode
}

// If the 3D scene crashes (WebGL lost, driver issue), fall back to the list view.
export class SpiralBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
