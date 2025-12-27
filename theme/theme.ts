// Modern theme configuration for Dormiease
export const theme = {
    colors: {
        primary: '#FF6B6B',
        secondary: '#9D84B7',
        accent: '#FF6B35',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f4f6f9',
        card: '#ffffff',
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
            light: '#94a3b8',
            white: '#ffffff'
        }
    },

    gradients: {
        primary: ['#FF6B6B', '#9D84B7'],
        warm: ['#FF6B35', '#FF8E53'],
        cool: ['#667eea', '#764ba2'],
        success: ['#22c55e', '#16a34a'],
        purple: ['#9D84B7', '#B8A4D4']
    },

    borderRadius: {
        small: 8,
        medium: 12,
        large: 16,
        xl: 20,
        full: 9999
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32
    },

    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8
        }
    }
};

export type Theme = typeof theme;
