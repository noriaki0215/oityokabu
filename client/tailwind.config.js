/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 和風カラーパレット
        'washi': '#F5F0E6',      // 和紙色
        'ai': '#1B4965',         // 藍色
        'shu': '#B5495B',        // 朱色
        'kin': '#C9A84C',        // 金色
        'kon': '#1C2938',        // 紺色
        'matcha': '#7BA23F',     // 抹茶色
      },
      fontFamily: {
        'serif-jp': ['"Noto Serif JP"', 'serif'],
      },
    },
  },
  plugins: [],
};
