import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, Drawer as PaperDrawer, Avatar, Title, Caption, Divider, Text, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View, Alert, StyleSheet, ImageBackground } from 'react-native';
import React, { useEffect, useState } from 'react';

import LoginPage from './screens/LoginPage';
import SignupPage from './screens/SignupPage';
import NewComplaintPage from './screens/NewComplaintPage';
import ComplaintDetailsPage from './screens/ComplaintDetailPage';
import HostelApplicationPage from './screens/RoomApplicationPage';
import MaintenanceListPage from './screens/MaintenanceListPage';
import NewMaintenancePage from './screens/NewMaintenancePage';
import ComplaintListPage from './screens/ComplaintListPage';
import MaintenanceDetailsPage from './screens/MaintenanceDetailPage';
import MessagingPage from './screens/MessagingPage';
import NotificationPage from './screens/NotificationPage';
import ProfilePage from './screens/ProfilePage';
import PaymentPage from './screens/PaymentPage';
import DashboardPage from './screens/DashboardPage';
import AddRoomPage from './screens/AddRoomPage';
import ErrorBoundary from './components/ErrorBoundary';
import { LinearGradient } from 'expo-linear-gradient';

// Standard stack/drawer setup
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// UniKL Theme Colors
const UNIKL_ORANGE = '#FF6B35';  // UniKL Primary Orange/Red
const UNIKL_DARK = '#1D3557';    // UniKL Dark Blue/Navy
const UNIKL_GOLD = '#F4A261';    // UniKL Gold/Yellow accent
const ACTIVE_BG = '#fff4ed';     // Very light orange for active item background
const TEXT_DARK = '#1e293b';     // Slate 800

// Custom UniKL Theme
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: UNIKL_ORANGE,
        secondary: UNIKL_DARK,
        tertiary: UNIKL_GOLD,
        background: '#f8fafc',
    },
};

function CustomDrawerContent(props: any) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                if (userJson) {
                    setUser(JSON.parse(userJson));
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('user');
                        props.navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    // Helper to check active route
    const isActive = (routeName: string) => {
        return props.state.routeNames[props.state.index] === routeName;
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Modern Gradient Header */}
            <LinearGradient
                colors={['#FF6B6B', '#9D84B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumHeader}
            >
                <View style={styles.userInfoSection}>
                    {user?.profile_image ? (
                        <Avatar.Image
                            source={{ uri: user.profile_image }}
                            size={64}
                            style={styles.avatar}
                        />
                    ) : (
                        <Avatar.Text
                            label={user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            size={64}
                            style={styles.avatar}
                            labelStyle={{ fontSize: 28, fontWeight: 'bold' }}
                            color={UNIKL_ORANGE}
                        />
                    )}
                    <View style={{ marginLeft: 16 }}>
                        <Title style={styles.premiumTitle}>{user?.name || 'User'}</Title>
                        <Caption style={styles.premiumCaption}>{user?.email || ''}</Caption>
                    </View>
                </View>
            </LinearGradient>

            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
                {/* Navigation Items */}
                <PaperDrawer.Section style={styles.drawerSection}>
                    <PaperDrawer.Item
                        icon="view-dashboard"
                        label="Dashboard"
                        active={isActive('Dashboard')}
                        onPress={() => props.navigation.navigate('Dashboard')}
                        theme={theme}
                        style={isActive('Dashboard') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="home-outline"
                        label="Hostels"
                        active={isActive('Hostels')}
                        onPress={() => props.navigation.navigate('Hostels')}
                        theme={theme}
                        style={isActive('Hostels') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="account-outline"
                        label="Profile"
                        active={isActive('Profile')}
                        onPress={() => props.navigation.navigate('Profile')}
                        theme={theme}
                        style={isActive('Profile') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="tools"
                        label="Maintenance"
                        active={isActive('Maintenance')}
                        onPress={() => props.navigation.navigate('Maintenance')}
                        theme={theme}
                        style={isActive('Maintenance') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="alert-circle-outline"
                        label="Complaints"
                        active={isActive('Complaints')}
                        onPress={() => props.navigation.navigate('Complaints')}
                        theme={theme}
                        style={isActive('Complaints') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="message-text-outline"
                        label="Messages"
                        active={isActive('Messages')}
                        onPress={() => props.navigation.navigate('Messages')}
                        theme={theme}
                        style={isActive('Messages') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="bell-outline"
                        label="Notifications"
                        active={isActive('Notifications')}
                        onPress={() => props.navigation.navigate('Notifications')}
                        theme={theme}
                        style={isActive('Notifications') ? styles.activeItem : styles.item}
                    />
                    <PaperDrawer.Item
                        icon="cash"
                        label="Payments"
                        active={isActive('Payments')}
                        onPress={() => props.navigation.navigate('Payments')}
                        theme={theme}
                        style={isActive('Payments') ? styles.activeItem : styles.item}
                    />
                </PaperDrawer.Section>
            </DrawerContentScrollView>

            {/* Logout Section */}
            <PaperDrawer.Section style={styles.bottomDrawerSection}>
                <PaperDrawer.Item
                    icon="logout"
                    label="Logout"
                    onPress={handleLogout}
                    theme={theme}
                />
            </PaperDrawer.Section>
        </View>
    );
}

function DrawerRoutes() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
                headerTintColor: TEXT_DARK,
                headerTitleStyle: { fontWeight: 'bold' },
                drawerActiveTintColor: UNIKL_ORANGE,
                drawerInactiveTintColor: '#64748b',
            }}
        >
            <Drawer.Screen name="Dashboard" component={DashboardPage} />
            <Drawer.Screen name="Hostels" component={HostelApplicationPage} />
            <Drawer.Screen name="Profile" component={ProfilePage} />
            <Drawer.Screen name="Maintenance" component={MaintenanceListPage} />
            <Drawer.Screen name="Complaints" component={ComplaintListPage} />
            <Drawer.Screen name="Messages" component={MessagingPage} />
            <Drawer.Screen name="Notifications" component={NotificationPage} />
            <Drawer.Screen name="Payments" component={PaymentPage} />
        </Drawer.Navigator>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <PaperProvider theme={theme}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen
                                name="Login"
                                component={LoginPage}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="Signup"
                                component={SignupPage}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="Main"
                                component={DrawerRoutes}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="ComplaintDetails"
                                component={ComplaintDetailsPage}
                                options={{ title: "Complaint Details" }}
                            />
                            <Stack.Screen
                                name="MaintenanceDetails"
                                component={MaintenanceDetailsPage}
                                options={{ title: "Maintenance Details" }}
                            />
                            <Stack.Screen
                                name="AddNewComplaint"
                                component={NewComplaintPage}
                                options={{ title: "Complaints" }}
                            />
                            <Stack.Screen
                                name="AddNewMaintenance"
                                component={NewMaintenancePage}
                                options={{ title: "Maintenance" }}
                            />
                            <Stack.Screen
                                name="AddRoom"
                                component={AddRoomPage}
                                options={{ title: "Add New Room" }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PaperProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    premiumHeader: {
        backgroundColor: UNIKL_ORANGE,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: UNIKL_GOLD,
        elevation: 4,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    premiumTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
    },
    premiumCaption: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: -2,
    },
    drawerSection: {
        paddingHorizontal: 12,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#e2e8f0',
        borderTopWidth: 1,
        paddingTop: 5,
        paddingHorizontal: 12,
    },
    activeItem: {
        backgroundColor: ACTIVE_BG,
        borderRadius: 12, // Pill shape
        marginVertical: 4,
    },
    item: {
        borderRadius: 12,
        marginVertical: 4,
    },
    activeLabel: {
        color: UNIKL_ORANGE,
        fontWeight: 'bold',
        fontSize: 15,
    },
    label: {
        color: '#475569', // Slate 600
        fontWeight: '500',
        fontSize: 15,
    }
});
