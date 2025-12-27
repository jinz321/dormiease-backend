import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

interface FloatingActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    gradient?: string[];
    size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    icon,
    onPress,
    gradient = theme.gradients.warm,
    size = 56
}) => {
    return (
        <Animatable.View
            animation="bounceIn"
            delay={300}
            style={[styles.container, { width: size, height: size }]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <LinearGradient
                    colors={gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.button,
                        { width: size, height: size, borderRadius: size / 2 }
                    ]}
                >
                    <Ionicons name={icon} size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        ...theme.shadows.large
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});
