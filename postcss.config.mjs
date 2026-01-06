/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 여기가 핵심입니다 (최신 버전)
  },
};

export default config;