// tailwind.config.ts or tailwind.config.js
import type { Config } from "tailwindcss"

const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#24a0ed", // Change to your preferred color
            },
        },
    },
    plugins: [],
}

export default config