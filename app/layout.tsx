import "./globals.css";
import "./styles/legacy/base.css";
import "./styles/legacy/boot.css";
import "./styles/legacy/ui.css";
import "./styles/legacy/drawer.css";
import "./styles/shell/responsive.css";

export const metadata = {
  title: "Studium",
  description: "Study like a game, finish like a pro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="nav-mode" data-view="dashboard">
        {children}
      </body>
    </html>
  );
}
