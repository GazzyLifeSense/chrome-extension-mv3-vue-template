const colors = require('tailwindcss/colors');

// 手动忽略编译时颜色更名警告
const _ = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
_.forEach(v => {
  delete colors[v];
});

module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    './src/**/*.ts',
    './src/**/*.tsx',
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
