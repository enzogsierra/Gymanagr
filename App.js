import React, { useEffect, useState } from "react";
import { View, StatusBar, Text, TouchableOpacity, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Settings, settingsInfo } from "./settings";
import { TextInput } from "react-native-gesture-handler";
import { initDatabase } from "./dbConfig";
import { colors, styles } from "./utils";

// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import StatsScreen from "./screens/StatsScreen";
import ClientsScreen from "./screens/ClientsScreen";
import ClientsScreen_add from "./screens/ClientsScreen_add";
import ClientsScreen_edit from "./screens/ClientsScreen_edit";
import SettingsScreen from "./screens/SettingsScreen";


export default function App() 
{
    const Tabs = createBottomTabNavigator();

    const [feePrice, setFeePrice] = useState(""); // Almacena el precio de la cuota que el usuario establezca (solo en firstlaunch)
    const [render, setRender] = useState(false); // Establece si debe renderizarse la pantalla o no
    const [firstLaunch, setFirstLaunch] = useState(false); // Establece si es la primera vez que se lanza la aplicación


    // Cuando carga la aplicación
    useEffect(() =>
    {
        // Iniciar la base de datos
        initDatabase();

        // Verificamos si ya se han creado las configuraciones iniciales. Si no existen, mostramos la pantalla "first launch"
        const checkSettings = async () =>
        {
            const value = await AsyncStorage.getItem(Settings.feePrice); // Obtenemos el precio de la cuota mensual
            
            setFirstLaunch((value === null)); // Si no existe el precio de cuota mensual, significa que es un "first launch"
            setRender(true); // Ya se puede renderizar la pantalla
        }
        checkSettings();
    }, []);


    // Cuando presiona en "Comenzar" (solo en pantalla "first launch")
    function onLaunchApp()
    {
        if(!feePrice) return ToastAndroid.showWithGravity("Indique un precio válido", ToastAndroid.SHORT, ToastAndroid.SHORT);
    
        // Funcion para crear las configuraciones iniciales
        const createDefaultSettings = async () =>
        {
            // Iterar sobre todas las configuraciones y darles un valor por defecto
            settingsInfo.forEach(async setting =>
            {
                await AsyncStorage.setItem(setting.key, setting.value.toString());
            });

            // Establecer precio de cuota
            await AsyncStorage.setItem(Settings.feePrice, feePrice);
        };
        createDefaultSettings();

        setFirstLaunch(false); // Ya se crearon las configuraciones iniciales. Se renderizará la pantalla normal
    }

    
    return (
        <View style={{flex: 1}}>
            <StatusBar animated="true" translucent={true}/>
            
            {render &&
                <NavigationContainer>
                    {firstLaunch ?
                        <View style={{flex: 1}}>
                            <StatusBar animated="true" translucent={true}/>
                
                            <View style={styles.container}>
                                <View style={styles.firstLaunch_container}>
                                    <Text style={styles.firstLaunch_h1}>Bienvenido a <Text style={{color: colors.primary}}>Gymanagr</Text></Text>
                                    <Text style={styles.firstLaunch_text}>Antes de comenzar, escriba la cuota mensual de su gimnasio. Puedes cambiar este precio en la sección de configuración.</Text>
                
                                    <View style={styles.firstLaunch_priceInputContainer}>
                                        <Ionicons name="logo-usd" size={24} color={colors.primary}/>
                                        
                                        <TextInput
                                            style={styles.firstLaunch_priceInput}
                                            onChangeText={(value) => setFeePrice((parseInt(value) ? parseInt(value) : "").toString())}
                                            value={feePrice}
                                            keyboardType="numeric"
                                            placeholder="0" 
                                            placeholderTextColor="#888">
                                        </TextInput>
                                    </View>
                
                                    <TouchableOpacity style={styles.firstLaunch_startContainer} onPress={() => onLaunchApp()} activeOpacity={0.75}>
                                        <Text style={styles.firstLaunch_startText}>Comenzar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    :
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
                                name="StatsTab"
                                component={StatsTab}
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
                    }
                </NavigationContainer>
            }
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

function StatsTab()
{
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Estadísticas"
                component={StatsScreen}
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