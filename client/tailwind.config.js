export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9', // Sky blue
                    600: '#0284c7',
                    700: '#0369a1',
                    900: '#0c4a6e',
                },
                accent: {
                    500: '#10b981', // Emerald
                    600: '#059669',
                },
                surface: '#f8fafc', // Slate 50
                dark: '#0f172a', // Slate 900
            }
        }
    },
    plugins: [],
};
