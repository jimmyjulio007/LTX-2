import Navbar from "@/widgets/navbar/ui/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16 md:pt-20" role="main">
        {children}
      </main>
    </>
  );
}
