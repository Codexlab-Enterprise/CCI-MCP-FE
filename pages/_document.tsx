import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import clsx from "clsx";

export default class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return Document.getInitialProps(ctx);
  }

  render() {
    return (
      <Html className="" lang="en">
        <Head />
        <body className={clsx("min-h-screen bg-background font-sans antialiased")}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
