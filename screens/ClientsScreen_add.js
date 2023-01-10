import React, { useEffect, useRef, useState } from "react";
import {View, Text, TextInput, Pressable, ToastAndroid, TouchableOpacity} from "react-native";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { db } from "../dbConfig";
import ModalSelector from "react-native-modal-selector";
import { ScrollView } from "react-native-gesture-handler";
import { styles } from "../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../settings";


export default function ClientsScreen_add()
{
    const navigation = useNavigation();

    // Modal togglers
    const [showCalendar, setShowCalendar] = useState(false);

    //  Información del formulario
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [payDate, setPayDate] = useState(formatISODate(new Date().toISOString())); //
    const [payMonths, setPayMonths] = useState(1); // 1 mes por default
    const [payment, setPayment] = useState(0); // Precio de la cuota (cargada desde loadSettings)

    // Inputs ref
    const inputName = useRef();
    const inputPhone = useRef();
    const inputPayment = useRef();
    const inputMonths = useRef();


    // Cuando carga la pantalla
    useEffect(() =>
    {
        // Cargar configuraciones
        loadSettings();

        setShowCalendar(false); // Oculta el calendario por default
    }, []);


    // Cuando selecciona una fecha
    function onCalendarChange(info, date)
    {
        setShowCalendar(false); // Ocultar el calendario
        
        if(info.type == "dismissed") return;

        const toISO = date.toISOString().toString(); // Convertir la fecha recibida del calendario a formato ISO y luego a String
        setPayDate(formatISODate(toISO)); // Almacenar el último pago en formato dd/MM/yyyy
    };

    // Cuando cambia la fecha de pago
    function onChangePayMonths(months)
    {
        setPayMonths(months);
    }

    // Cuando presiona en "Guardar"
    function onCreateClient()
    {
        // Obtener datos del formulario y convertirlos a datos de sqlite
        const sqliteDate = toSqliteDate(payDate ?? "NOW"); // Convertir de dd/MM/yyyy a yyyy/MM/dd, o 'now' si no hay una fecha establecida

        const qName = (name) ? name.trim() : null;
        const qPhone = (phone) ? phone.trim() : null;
        const qPayDate = sqliteDate;
        const qPayMonths = parseInt(payMonths) ? parseInt(payMonths) : null;
        const qPayment = parseInt(payment) ? parseInt(payment) : null;

        if(!qName) return ToastAndroid.showWithGravity("El nombre es requerido", ToastAndroid.SHORT, ToastAndroid.CENTER);
        if(!qPayMonths || qPayMonths < 0) return ToastAndroid.showWithGravity("Los meses de servicio son requeridos", ToastAndroid.SHORT, ToastAndroid.CENTER);
        if(!qPayment || qPayment < 0) return ToastAndroid.showWithGravity("El precio es requerido", ToastAndroid.SHORT, ToastAndroid.CENTER);


        // Añadir cliente a la db
        db.transaction(tx =>
        {
            const query = 
            `
                INSERT INTO clients (name, phone, payDate, nextPayDate) 
                VALUES 
                (
                    ?,
                    ?,
                    JULIANDAY(DATE('${qPayDate}')),
                    JULIANDAY(DATE('${qPayDate}', '+${qPayMonths} month'))
                )
            `;

            // Crear nuevo pago
            tx.executeSql(query, [qName, qPhone], (_, res) =>
            {
                const clientId = res.insertId;
                const payQuery = `INSERT INTO payments (price, date, client_id) VALUES (?, ?, ?)`;

                tx.executeSql(payQuery, [qPayment, sqliteDate, clientId], (_, res) => 
                {
                    navigation.goBack();
                    ToastAndroid.showWithGravity("Cliente añadido correctamente", ToastAndroid.SHORT, ToastAndroid.CENTER);
                }, 
                (error, _) => 
                {
                    ToastAndroid.showWithGravity(error.toString(), ToastAndroid.LONG, ToastAndroid.BOTTOM);
                });
            });
        }, (error, _) => 
        {
            error = error.toString();
            let msg = error;

            if(error.includes("code 2067"))
            {
                if(error.includes("clients.name")) msg = "El nombre del cliente ya está en uso";
                if(error.includes("clients.phone")) msg = "El número de teléfono ya está en uso";
            }

            ToastAndroid.showWithGravity(msg, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        });
    }

    // Cargar configuraciones
    const loadSettings = async () =>
    {
        const feePriceValue = await AsyncStorage.getItem(Settings.feePrice);

        setPayment(feePriceValue);
    }


    return (
        <View style={styles.container}>
            <ScrollView>
                <Pressable style={styles.inputGroup} onPress={() => inputName.current.focus()}>
                    <Ionicons style={styles.formLabel} name="person"/>
                    <TextInput style={styles.formControl} onChangeText={setName} value={name} ref={inputName} onSubmitEditing={() => inputPhone.current.focus()} autoFocus={true} blurOnSubmit={false} autoCapitalize="words" placeholder="Nombre" placeholderTextColor="#888" maxLength={32}></TextInput>
                </Pressable>


                <Pressable style={styles.inputGroup} onPress={() => inputPhone.current.focus()}>
                    <Ionicons style={styles.formLabel} name="call"/>
                    <TextInput style={styles.formControl} onChangeText={setPhone} value={phone} ref={inputPhone} keyboardType="numeric" placeholder="Teléfono" placeholderTextColor="#888"></TextInput>
                </Pressable>


                <Pressable style={styles.inputGroup} onPress={() => inputPayment.current.focus()}>
                    <Ionicons style={styles.formLabel} name="logo-usd"/>
                    <TextInput style={styles.formControl} onChangeText={setPayment} value={payment.toString()} ref={inputPayment} keyboardType="numeric" placeholder="Total a pagar" placeholderTextColor="#888"></TextInput>
                </Pressable>


                <Pressable style={styles.inputGroup} onPress={() => setShowCalendar(true)}>
                    <Ionicons style={styles.formLabel} name="calendar"/>

                    { (payDate == formatISODate(new Date().toISOString())) && <TextInput style={[styles.formControl, {color: "white"}]} editable={false} value={payDate}></TextInput>}
                    { (payDate != formatISODate(new Date().toISOString())) && <TextInput style={[styles.formControl, {color: "yellow"}]} editable={false} value={payDate}></TextInput>}

                    {showCalendar && (<RNDateTimePicker value={new Date()} mode="date" onChange={(info, date) => onCalendarChange(info, date)}></RNDateTimePicker>)}
                </Pressable>


                <Pressable style={styles.inputGroup} onPress={() => inputMonths.current.focus()}>
                    <Ionicons style={styles.formLabel} name="time"/>
                    <TextInput style={styles.formControl} onChangeText={onChangePayMonths} value={payMonths.toString()}  ref={inputMonths} keyboardType="numeric" placeholder="Meses de servicio" placeholderTextColor="#888"></TextInput>
                </Pressable>


                <View style={styles.btnWrapper}>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
                        <Text style={styles.btnText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={onCreateClient}>
                        <Text style={styles.btnText}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function formatISODate(date)
{
    const tmp = date.split("T");
    const s = tmp[0].split("-");
    return `${s[2]}/${s[1]}/${s[0]}`;
}

function toSqliteDate(date)
{
    const s = date.split("/");
    return `${s[2]}-${s[1]}-${s[0]}`; 
}

