import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body>
                <script dangerouslySetInnerHTML={{
                    __html: `
            (function() {
              function setTheme(theme) {
                document.documentElement.className = theme;
                localStorage.setItem('theme', theme);
              }

              var theme = localStorage.getItem('theme');
              if (theme) {
                setTheme(theme);
              } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
              } else {
                setTheme('light');
              }
            })();
          `
                }} />
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}