// Root layout: minimal pass-through.
// The [locale]/layout.tsx provides <html> and <body> with the dynamic lang attribute.
// Root not-found.tsx provides its own <html>/<body> for non-locale routes.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
