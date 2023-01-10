import React, { useEffect } from "react";
import { View, StatusBar } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons'; 
import { initDatabase } from "./dbConfig";
import { colors } from "./utils";


// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen";
import ClientsScreen from "./screens/ClientsScreen";
import ClientsScreen_add from "./screens/ClientsScreen_add";
import ClientsScreen_edit from "./screens/ClientsScreen_edit";
import SettingsScreen from "./screens/SettingsScreen";


export default function App() 
{
    const Tabs = createBottomTabNavigator();

    useEffect(() =>
    {
        initDatabase();
    });


    return (
        <View style={{flex: 1}}>
            <StatusBar animated="true" translucent={true}/>
            
            <NavigationContainer>
                <Tabs.Navigator screenOptions={{tabBarActiveTintColor: colors.primary, tabBarHideOnKeyboard: 1}}>
                    <Tabs.Screen
                        name="ClientsTab"
                        component={ClientsTab}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="address-card" size={size} color={color} />
                            ),
                            headerShown: false,
                            tabBarShowLabel: false,
                            tabBarStyle: {backgroundColor: colors.background, borderTopColor: "transparent"}
                        }}
                    />

                    <Tabs.Screen
                        name="HomeTab"
                        component={HomeTab}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="chart-bar" size={size} color={color} />
                            ),
                            headerShown: false,
                            tabBarShowLabel: false,
                            tabBarStyle: {backgroundColor: colors.background, borderTopColor: "transparent"}
                        }}
                    />

                    <Tabs.Screen
                        name="SettingsTab"
                        component={SettingsTab}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="cog" size={size} color={color} />
                            ),
                            headerShown: false,
                            tabBarShowLabel: false,
                            tabBarStyle: {backgroundColor: colors.background, borderTopColor: "transparent"}
                        }}
                    />
                </Tabs.Navigator>
            </NavigationContainer>
        </View>
    );
}


// Stacks
function ClientsTab()
{
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Clientes"
                component={ClientsScreen}
                options={
                {
                    headerStyle: {backgroundColor: colors.background},
                    headerTitleStyle: {fontSize: 24, color: colors.secondary},
                }}
            />

            <Stack.Screen 
                name="Añadir cliente"
                component={ClientsScreen_add}
                options={
                {
                    animation: "slide_from_bottom",
                    headerStyle: {backgroundColor: colors.background},
                    headerTitleStyle: {color: colors.secondary},
                    headerTintColor: colors.primary
                }}
            />

            <Stack.Screen 
                name="Información de cliente"
                component={ClientsScreen_edit}
                options={
                {
                    animation: "slide_from_bottom",
                    headerStyle: {backgroundColor: colors.background},
                    headerTitleStyle: {color: colors.secondary},
                    headerTintColor: colors.primary
                }}
            />
        </Stack.Navigator>
    );
}

function HomeTab()
{
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Estadísticas"
                component={HomeScreen}
                options={
                {
                    headerStyle: {backgroundColor: colors.background},
                    headerTitleStyle: {fontSize: 24, color: colors.secondary},
                }}
            />
        </Stack.Navigator>
    );
}

function SettingsTab()
{
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Configuración"
                component={SettingsScreen}
                options={
                {
                    headerStyle: {backgroundColor: colors.background},
                    headerTitleStyle: {fontSize: 24, color: colors.secondary},
                }}
            />
        </Stack.Navigator>
    );
}