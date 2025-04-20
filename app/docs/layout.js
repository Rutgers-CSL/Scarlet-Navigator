import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

const navbar = (
  <Navbar
    logo={<b>Scarlet Navigator</b>}
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Scarlet Labs.</Footer>;

// Fetch pageMap in a separate async function
async function fetchPageMap() {
  return getPageMap();
}

export default async function RootLayout({ children }) {
  // Fetch pageMap before rendering
  const pageMap = await fetchPageMap();

  return (
    <html
      // Not required, but good for SEO
      lang='en'
      // Required to be set
      dir='ltr'
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          nextThemes={{
            defaultTheme: 'light',
          }}
          navbar={navbar}
          pageMap={pageMap.filter(
            (page) => page.name !== 'dashboard' && page.name !== 'index'
          )}
          docsRepositoryBase='https://github.com/Rutgers-CSL/Scarlet-Navigator'
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
