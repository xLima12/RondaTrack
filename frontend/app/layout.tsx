import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "RondaTrack",
  description: "Monitoramento de dispositivos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}