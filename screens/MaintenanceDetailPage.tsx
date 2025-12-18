// MaintenanceDetailsPage.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, Card, Button, Text, Divider } from 'react-native-paper';

export default function MaintenanceDetailsPage({ route, navigation }: any) {
    const { maintenance } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>{maintenance.title}</Title>
                    <Paragraph style={styles.status}>Status: {maintenance.status} </Paragraph>
                    <Divider style={styles.divider} />

                    <Text variant="labelLarge" style={styles.label}>Details</Text>
                    <Paragraph style={styles.text}>{maintenance.details}</Paragraph>

                    <Text variant="labelLarge" style={styles.label}>Admin Reply</Text>
                    <Paragraph style={[styles.text, !maintenance.reply && styles.placeholder]}>
                        {maintenance.reply || 'No reply from maintenance team yet.'}
                    </Paragraph>
                </Card.Content>
            </Card>

            <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
            >
                Go Back
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f4f6f9',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1e293b'
    },
    status: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 10,
        fontStyle: 'italic'
    },
    divider: {
        marginVertical: 12
    },
    label: {
        marginTop: 10,
        marginBottom: 4,
        color: '#FF6B35',
        fontWeight: 'bold'
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: '#334155',
        marginBottom: 10
    },
    placeholder: {
        color: '#94a3b8',
        fontStyle: 'italic'
    },
    button: {
        borderRadius: 8,
        borderColor: '#FF6B35'
    }
});
