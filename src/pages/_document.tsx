import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"></link>
      </Head>
      <body className="section h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
