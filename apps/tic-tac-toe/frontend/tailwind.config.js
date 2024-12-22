const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      data: {
        hovered: 'hovered~="true"',
      },
      animation: {
        ripple: 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
      },
      keyframes: {
        ripple: {
          '0%': {
            top: '45%',
            left: '45%',
            width: '8%',
            height: '8%',
            opacity: '0',
          },
          '4.9%': {
            top: '45%',
            left: '45%',
            width: '8%',
            height: '8%',
            opacity: '0',
          },
          '5%': {
            top: '45%',
            left: '45%',
            width: '8%',
            height: '8%',
            opacity: '1',
          },
          '100%': {
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animate-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('transitionDelay'),
        },
      );
    }),
  ],
};
