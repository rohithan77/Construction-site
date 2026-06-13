import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import LenisProvider from "@/components/LenisProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </LenisProvider>
  );
}
