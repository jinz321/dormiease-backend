import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

interface ModernCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    gradient?: string[];
    style?: ViewStyle;
    borderRadius?: number;
    shadow?: 'small' | 'medium' | 'large';
}

export const ModernCard: React.FC<ModernCardProps> = ({
    children,
    onPress,
    gradient,
    style,
    borderRadius = theme.borderRadius.large,
    shadow = 'medium'
}) => {
    const shadowStyle = theme.shadows[shadow];

    if (gradient) {
        return (
            <Animatable.View animation="fadeInUp" duration={600}>
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.9}
                    disabled={!onPress}
                >
                    <LinearGradient
                        colors={gradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.card,
                            { borderRadius },
                            shadowStyle,
                            style
                        ]}
                    >
                        {children}
                    </LinearGradient>
                </TouchableOpacity>
            </Animatable.View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp" duration={600}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                disabled={!onPress}
                style={[
                    styles.card,
                    { borderRadius, backgroundColor: theme.colors.card },
                    shadowStyle,
                    style
                ]}
            >
                {children}
            </TouchableOpacity>
        </Animatable.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md
    }
});
