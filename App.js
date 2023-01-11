import React, { useCallback, useEffect, useState } from "react";
import { View, StatusBar, Text, TouchableOpacity, ToastAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TextInput } from "react-native-gesture-handler";
import * as Application from 'expo-application';



import { initDatabase } from "./dbConfig";
import { Settings, settingsInfo } from "./settings";
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


// Serial key
const SERIAL_KEY_URL = "http://compustack-env.eba-keg26dup.sa-east-1.elasticbeanstalk.com/serialKey";
const SERIAL_KEY_STORAGE_ITEM = "serialKey_code";


export default function App() 
{
    const Tabs = createBottomTabNavigator();

    const [render, setRender] = useState(false); // Establece si debe renderizarse la pantalla o no


    // Cuando carga la aplicación
    useEffect(() =>
    {
        // Iniciar la base de datos
        initDatabase();

        // Verificar si el usuario realizo las configuraciones iniciales
        checkAppInit();
    }, []);


    /*
        LAS SIGUIENTES FUNCIONES SON PARA LA PANTALLA FIRST LAUNCH
    */
    const [firstLaunch, setFirstLaunch] = useState(false); // Establece si es la primera vez que se lanza la aplicación
    const [firstLaunchStep, setFirstLaunchStep] = useState(1); 
    const [activationCode, setActivationCode] = useState(""); // Código de activacion de la aplicacion
    const [activationFailedMsg, setActivationFailedMsg] = useState("");
    const [feePrice, setFeePrice] = useState(""); // Almacena el precio de la cuota que el usuario establezca


    // Funcion para verificar si el usuario ya realizo las configuraciones iniciales. Si no, mostramos la pantalla de first launch
    async function checkAppInit()
    {
        const code = await AsyncStorage.getItem(SERIAL_KEY_STORAGE_ITEM) ?? null; // Obtenemos el codigo de activacion
        const fee = await AsyncStorage.getItem(Settings.feePrice) ?? null; // Obtenemos la cuota mensual

        if(!code) // Si el usuario aun no activo la aplicacion
        {
            setFirstLaunch(true); // Mostramos pantalla de first launch
            setFirstLaunchStep(1); // En el paso 1
        }
        else if(!fee) // Si el usuario activo la aplicacion, pero no termino de configurar la cuota inicial
        {
            setFirstLaunch(true); // ...
            setFirstLaunchStep(2);
        }
        else // El usuario ya realizo las configuraciones iniciales
        {
            setFirstLaunch(false); // No mostrar la pantalla de first launch
            checkSerialKeyValidation(); // Verifica si el serial key de la aplicacion sigue siendo valido
        }
        
        setRender(true); // Ya se puede renderizar la pantalla
    }

    // Funcion para verificar si el serial key de la aplicacion sigue siendo valido
    async function checkSerialKeyValidation()
    {
        const deviceId = await getDeviceId() ?? null; // Obtener ID del dispositivo
        const code = await AsyncStorage.getItem(SERIAL_KEY_STORAGE_ITEM) ?? null; // Obtener codigo de activacion de la aplicacion

        if(deviceId == null || code == null) return; // Si algun valor es null, simplemente saltearse la verificacion

        try
        {
            // Crear form con los datos del dispositivo y el codigo
            const form = new FormData();
            form.append("deviceId", deviceId);
            form.append("code", code);
            
            // Enviar peticion al servidor
            const api = await fetch(SERIAL_KEY_URL + "/registerDevice", 
            {
                method: "POST",
                headers: {"Application-Type": "application/json"},
                body: form
            });
            const response = await api.json();

            if(response.statusCode != 200) // El serial key ya no es valido
            {
                // Borramos el code guardado en el dispositivo del usuario
                // La proxima vez que el usuario inicie la aplicacion, no tendra la aplicacion activada
                // Por lo tanto, no podra usarla hasta volverla a activar
                await AsyncStorage.removeItem(SERIAL_KEY_STORAGE_ITEM);
            }
        }
        catch {}
    }

    // Obtiene el unique id del dispositivo, sea iOS o Android
    async function getDeviceId()
    {
        if(Platform.OS == "android") return Application.androidId;
        else if(Platform.OS == "ios")
        {
            const deviceId = await Application.getIosIdForVendorAsync();
            return (deviceId != "nil") ? deviceId : null;
        } 
        return null;
    }

    // Cuando presiona en "Siguiente" en el paso de activar aplicacion
    async function onActivateApp()
    {
        const deviceId = await getDeviceId() ?? ""; // Obtener ID del dispositivo
        const code = activationCode; // Obtener codigo de activacion introducido por el usuario

        try 
        {
            // Crear form con los datos del dispositivo y el codigo
            const form = new FormData();
            form.append("deviceId", deviceId);
            form.append("code", code);
            
            // Enviar peticion al servidor
            const api = await fetch(SERIAL_KEY_URL + "/registerDevice", 
            {
                method: "POST",
                headers: {"Application-Type": "application/json"},
                body: form
            });
            const response = await api.json();

            if(response.statusCode == 200) // Codigo activado correctamente
            {
                await AsyncStorage.setItem(SERIAL_KEY_STORAGE_ITEM, code); // Guardarmos el code dentro del dispositivo del usuario

                setFirstLaunchStep(firstLaunchStep + 1); // Pasar al siguiente paso
                ToastAndroid.showWithGravity("Aplicación activada correctamente", ToastAndroid.LONG, ToastAndroid.BOTTOM)
            }
            else // Ocurrió un error al activar el producto
            {
                setActivationFailedMsg(response.message);
            }
        } 
        catch {}
    }

    // Cuando presiona en "Comenzar"
    function onStartApp()
    {
        if(!feePrice) return ToastAndroid.showWithGravity("Indique un precio", ToastAndroid.SHORT, ToastAndroid.SHORT);
    
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
            <> 
                {firstLaunch ?
                    <View style={{flex: 1}}>
                        <View style={styles.container}>
                            {firstLaunchStep == 1 &&
                                <View style={styles.firstLaunch_container}>
                                    <Text style={styles.firstLaunch_h1}>Bienvenido a <Text style={{color: colors.primary}}>Gymanagr</Text></Text>
                                    <Text style={styles.firstLaunch_text}>Antes de comenzar, digite el código de activación que le fue entregado al comprar la aplicación. Necesitas estar conectado a Internet.</Text>
                
                                    {activationFailedMsg &&
                                        <View style={{marginTop: 16}}>
                                            <Text style={[styles.firstLaunch_text, {color: "red"}]}>Ocurrió un problema al activar la aplicación.</Text>
                                            <Text style={[styles.firstLaunch_text, {color: "red"}]}>{activationFailedMsg}</Text>
                                            <Text style={styles.firstLaunch_text}>Si crees que se trata de un error, contáctate con el proveedor de la aplicación.</Text>
                                        </View>
                                    }

                                    <View style={styles.firstLaunch_priceInputContainer}>
                                        <Ionicons name="key" style={styles.firstLaunch_priceInputIcon}/>
                                        
                                        <TextInput
                                            style={[styles.firstLaunch_priceInput, {flex: 1}]}
                                            onChangeText={setActivationCode}
                                            value={activationCode}
                                            keyboardType="default"
                                            placeholder="Código de activación" 
                                            placeholderTextColor="#888">
                                        </TextInput>
                                    </View>
                
                                    <TouchableOpacity style={[styles.firstLaunch_startContainer, {backgroundColor: "transparent", borderWidth: 1, borderColor: "white"}]} onPress={() => onActivateApp()} activeOpacity={0.75}>
                                        <Text style={styles.firstLaunch_startText}>Siguiente</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {firstLaunchStep == 2 &&
                                <View style={styles.firstLaunch_container}>
                                    <Text style={styles.firstLaunch_h1}>Gracias por comprar <Text style={{color: colors.primary}}>Gymanagr</Text></Text>
                                    <Text style={styles.firstLaunch_text}>Ahora, escriba la cuota mensual de su gimnasio. Puedes cambiar este precio en la sección de configuración.</Text>
                
                                    <View style={styles.firstLaunch_priceInputContainer}>
                                        <Ionicons name="logo-usd" style={styles.firstLaunch_priceInputIcon}/>
                                        
                                        <TextInput
                                            style={styles.firstLaunch_priceInput}
                                            onChangeText={(value) => setFeePrice((parseInt(value) ? parseInt(value) : "").toString())}
                                            value={feePrice}
                                            keyboardType="numeric"
                                            placeholder="0" 
                                            placeholderTextColor="#888">
                                        </TextInput>
                                    </View>
                
                                    <TouchableOpacity style={styles.firstLaunch_startContainer} onPress={() => onStartApp()} activeOpacity={0.75}>
                                        <Text style={styles.firstLaunch_startText}>Comenzar</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                    </View>
                : 
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
                    </NavigationContainer>
                }
            </>
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