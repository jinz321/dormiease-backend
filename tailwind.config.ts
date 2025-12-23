// tailwind.config.ts or tailwind.config.js
import type { Config } from "tailwindcss"

const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#FF6B6B", // Coral Red
                secondary: "#9D84B7", // Muted Purple
                accent: "#FF6B35", // Vibrant Orange
                success: "#22c55e",
                warning: "#f59e0b",
                error: "#ef4444",
                background: "#f4f6f9",
            },
        },
    },
    plugins: [],
}

export default config