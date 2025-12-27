import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UniklLogo({ size = 120 }) {
    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={styles.logoBox}>
                <Text style={styles.logoText}>UNIKL</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    logoBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#667eea',
        letterSpacing: 2,
    },
});
