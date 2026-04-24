import LandingNav from '@/components/layout/LandingNav';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
