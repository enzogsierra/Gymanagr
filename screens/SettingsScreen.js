import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import {FontAwesome5} from '@expo/vector-icons'; 

import {settingsInfo} from "../settings";
import { colors, styles } from "../utils";


export default function SettingsScreen()
{
    const [settingsList, setSettingsList] = useState([]);
    const [modalInfo, setModalInfo] = useState();
    const [showModal, setShowModal] = useState(false);


    // Cuando la pantalla entre en focus
    useFocusEffect(useCallback(() =>
    {
        loadSettings();

        setShowModal(false);
        setModalInfo();
    }, []));


    // Cuando se presiona en una configuracion (lista)
    function onSettingPress(key)
    {
        settingsInfo.forEach(setting =>
        {
            if(setting.key == key) setModalInfo(setting);
        });

        setShowModal(true);
    }

    // Cuando se presiona en el boton "Guardar" dentro de una configuracion
    function onSettingSave(setting)
    {
        saveSetting(setting.key, setting.value);
        setShowModal(false);
        ToastAndroid.showWithGravity("Configuración guardada", ToastAndroid.SHORT, ToastAndroid.BOTTOM)
    }


    // Cargar preferencias de usuario
    const loadSettings = async () => 
    {
        const info = [];
        for(const setting of settingsInfo) 
        {
            setting.value = await AsyncStorage.getItem(setting.key) ?? setting.value;
            info.push(setting);
        }

        setSettingsList(info);
    };

    // Guardar preferencia de usuario
    const saveSetting = async (key, value) =>
    {
        await AsyncStorage.setItem(key, value);
        await loadSettings();
    }

    // Al presionar en "Contactar"
    const openLink = async (url) =>
    {
        const supported = await Linking.canOpenURL(url);
        
        if(supported) await Linking.openURL(url);
        else ToastAndroid.showWithGravity("Ocurrió un error al abrir el enlace", ToastAndroid.SHORT, ToastAndroid.CENTER);
    };

    return (
        <View style={{flex: 1, backgroundColor: colors.background}}>
            <ScrollView>
                {settingsList && settingsList.map((setting, index) =>
                {
                    return (
                        <TouchableOpacity key={setting.key} style={[ss.setting, (index == 0 )? {borderTopWidth: 1} : {}]} onPress={() => onSettingPress(setting.key)}>
                            <Text style={ss.settingTitle}>{setting.title}</Text>
                            <Text style={ss.settingSubtitle}>{setting.subtitle.replace("{}", setting.value.toString())}</Text>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity style={ss.setting} onPress={() => openLink("http://compustack.com.ar/")}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={ss.settingTitle}>Contáctanos</Text>
                        <FontAwesome5 name="external-link-alt" style={{marginStart: 8, fontSize: 16, color: "white"}}/>
                    </View>
                </TouchableOpacity>

                <View style={{marginTop: 8}}>
                    <Text style={{textAlign: "center", color: colors.muted}}>Copyright (c) 2023 - Compustack</Text>
                </View>
            </ScrollView>

            {modalInfo && 
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => { setShowModal(false); }}
                >
                    <View style={styles.filterModalWrapper}>
                        <View style={styles.filterModalCard}>
                            <Text style={styles.filterModal_headerText}>{modalInfo.title}</Text>
                            <Text style={{color: colors.muted, fontSize: 16, marginBottom: 16}}>{modalInfo.description}</Text>

                            <View style={styles.payModal_formGroup}>
                                <TextInput 
                                    style={styles.payModal_formInput}
                                    onChangeText={value => setModalInfo({...modalInfo, value: value})}
                                    value={modalInfo.value.toString()}
                                    keyboardType={modalInfo.keyboardType ?? "default"}
                                    >
                                </TextInput>
                            </View>

                            <View style={styles.filterModal_actionBtns}>
                                <TouchableOpacity style={styles.filterModal_actionBtn} onPress={() => setShowModal(false)}>
                                    <Text style={styles.filterModal_actionBtnText}>Cerrar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.filterModal_actionBtn} onPress={() => onSettingSave(modalInfo)}>
                                    <Text style={styles.filterModal_actionBtnText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            }
        </View>
    );
}

const ss = StyleSheet.create(
{
    setting:
    {
        borderBottomWidth: 1,
        borderColor: "#555",
        padding: 16,
    },
    settingTitle:
    {
        color: colors.secondary,
        fontSize: 20,
    },
    settingSubtitle:
    {
        color: colors.muted,
        fontSize: 16,
    }
});
