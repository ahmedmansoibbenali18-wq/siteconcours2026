import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <h1>Cette page ne peut pas être affichée.</h1>
          <p>Une erreur inattendue est survenue. Rechargez l’application pour réessayer.</p>
          <button className="primary-button" onClick={() => window.location.reload()} type="button">
            Recharger la page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
