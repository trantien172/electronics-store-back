import Header from './layout/Header';
import Footer from './layout/Footer';
import Providers from '@/components/Providers'
import { Toaster } from 'sonner'


export default function PublicWebLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
                <div className="flex flex-col min-h-screen">
                    {/* Public routes and current client-facing routes share this shell. */}
                    <Header />

                    <main className="flex-1">{children}</main>

                    <Footer />
                    <Toaster />

                </div>
        </Providers>
    );
}
