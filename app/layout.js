import "./globals.css";

export const metadata = {
  title: "Beckstrand Fantasy F1",
  description: "Family Fantasy F1 picks and leaderboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        <div className="max-w-lg mx-auto px-4 pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}
