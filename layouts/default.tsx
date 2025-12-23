import { Head } from "./head";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function DefaultLayout({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar: Boolean;
}) {
  return (
    <div className="relative flex flex-col w-full overflow-hidden h-screen">
      <Head />
      <div className="block  md:flex lg:flex h-screen">
        <Navbar />
        {showSidebar ? <Sidebar /> : null}

        <main className="mx-auto w-full px-2 pt-2">{children}</main>
      </div>
      {/*       
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://nextui-docs-v2.vercel.app?utm_source=next-pages-template"
          title="nextui.org homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">NextUI</p>
        </Link>
      </footer> */}
    </div>
  );
}
