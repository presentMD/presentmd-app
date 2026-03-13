import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initGA } from './lib/analytics'

// __GA_ID__ is injected at build time by vite.config.ts from the
// GOOGLE_ANALYTICS_ID environment variable.  Falls back to '' when unset.
declare const __GA_ID__: string;

initGA(typeof __GA_ID__ !== 'undefined' ? __GA_ID__ : '');

createRoot(document.getElementById("root")!).render(<App />);
