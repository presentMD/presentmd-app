import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

declare const __GA_ID__: string;

function initGA() {
  if (!__GA_ID__) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${__GA_ID__}`;
  document.head.appendChild(script);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', __GA_ID__);
}

initGA();

createRoot(document.getElementById("root")!).render(<App />);
