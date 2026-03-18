import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinançasPro - Gestão Financeira Pessoal',
  description: 'Gerencie suas finanças pessoais de forma simples e eficiente. Controle suas contas, categorias e transações.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className="font-sans antialiased">
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="tema-bom"
            enableSystem={false}
            themes={['tema-bom', 'dark', 'green-dark', 'light', 'green-light']}
          >
            {children}
          </ThemeProvider>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  )
}
