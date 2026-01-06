import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="ko">

            <Head>
                {/* 메타 태그 */}
                <meta charSet="utf-8" />
                <meta name="description" content="MoodFolio - 커리어에 Mood를 켜다" />
                <meta name="keywords" content="portfolio, mood, career, 포트폴리오" />

                {/* 파비콘 */}
                <link rel="icon" href="/favicon.ico" />

                {/* 프리로드 */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
