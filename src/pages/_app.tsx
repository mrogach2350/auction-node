import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
