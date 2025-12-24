import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class", ".dark"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
            // The Luxe Salon Theme
  			primary: {
  				DEFAULT: '#e11d48', // Rose-600
  				foreground: 'hsl(var(--primary-foreground))'
  			},
            secondary: {
                DEFAULT: '#d97706', // Amber-600 (Gold)
            }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;