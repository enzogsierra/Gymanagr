import React, {useCallback, useEffect, useRef, useState } from "react";
import {View, Text, TextInput, Pressable, ToastAndroid, Modal, Alert, TouchableOpacity} from "react-native";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { db } from "../dbConfig";
import ModalSelector from "react-native-modal-selector";
import { ScrollView } from "react-native-gesture-handler";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../settings";

export default function ClientsScreen_edit({route})
{
    const navigation = useNavigation();
    const {clientId} = route.params;

    // Modal togglers
    const [showPayModal, setShowPayModal] = useState(false); // Establece si se muestra o no el modal de pago
    const [showCalendar, setShowCalendar] = useState(false);

    // Datos
    const [client, setClient] = useState();
    const [payInfo, setPayInfo] = useState({});
    const [julianDay, setJulianDay] = useState(0);
    const [feePrice, setFeePrice] = useState(0);
    const [inactiveAfterDays, setInactiveAfterDays] = useState(0); // settings.js

    // Inputs ref
    const inputName = useRef();
    const inputPhone = useRef();


    // Cuando la pantalla entre en focus
    useFocusEffect(useCallback(() => 
    {
        // Cargar configuraciones
        loadSettings();

        // Otener "julianday" actual (hoy)
        db.transaction(tx => 
        {
            tx.executeSql("SELECT JULIANDAY(DATE('NOW')) AS julianday", [], (_, res) => 
            {
                setJulianDay(res.rows._array[0].julianday);
            });
        });

        // Cargar datos del cliente
        db.transaction(tx => 
        {
            tx.executeSql("SELECT *, DATE(JULIANDAY(payDate)) as fPayDate, DATE(JULIANDAY(nextPayDate)) as fNextPayDate FROM clients WHERE id = ?", [clientId], (_, res) => 
            {
                const data = res.rows._array[0];
                setClient(data);
            }, 
            (_, error) => { console.log(error); });
        });


        //
        setShowCalendar(false);
    }, []));


    // Escuchar por cambios en la información de "cliente"
    useEffect(() =>
    {
        if(client) // Si se cargó el cliente
        {
            // Actualizar información de pago
            const diff = parseInt(julianDay - client.nextPayDate);

            setPayInfo(
            {
                date: (diff > inactiveAfterDays) ? (formatISODate(new Date().toISOString())) : formatSqliteDate(client.fNextPayDate),
                months: "1",
                price: feePrice.toString(),
            });

            // Actualizar estado de cuota
            if(!client.status) // Si todavían no se estableció el estado de cuota
            {
                const diff = parseInt(julianDay - client.nextPayDate); // Obtener diferencia de días entre el día actual y el día del siguiente pago
                
                let status = "";
                if(diff >= inactiveAfterDays) status = "Inactivo"; // servicio inactivo, ultima cuota pagada hace un mes o mas
                else if(diff > 0) status = "Pendiente"; // servicio pendiente, debe la cuota hace menos de un mes
                else if(diff <= 0) status = "Activo"; // serivicio activo, cuota al día 
                
                setClient({...client, status: status}); 
            }
        }
    }, [client]);


    // Cuando presiona en "Guardar"
    function onEditClient()
    {
        // Obtener datos del formulario y convertirlos a datos de sqlite
        const qName = (client.name) ? client.name.trim() : null;
        const qPhone = (client.phone) ? client.phone.trim() : null;

        if(!qName) return ToastAndroid.showWithGravity("El nombre es requerido", ToastAndroid.SHORT, ToastAndroid.CENTER);
        

        // Editar cliente
        db.transaction(async tx =>
        {
            const query = 
            `
                UPDATE clients
                SET 
                    name = ?,
                    phone = ?
                WHERE 
                    id = ?
            `;

            tx.executeSql(query, [qName, qPhone, clientId], (_, res) => // Ejecutar consulta
            {
                navigation.goBack(); 
                ToastAndroid.showWithGravity("Cliente editado", ToastAndroid.SHORT, ToastAndroid.CENTER);
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

    // Cuando cambia la fecha de pago
    function onCalendarChange(info, date)
    {
        setShowCalendar(false); // Ocultar calendario

        if(info.type == "dismissed") return;

        const isoDate = date.toISOString(); // Formatear la fecha recibida a formato ISO
        const fDate = formatISODate(isoDate); // Formatear la fecha ISO a dd/MM/yyyy
        
        setPayInfo({...payInfo, date: fDate}); // Cambiar la información de pago
    }

    // Añadir pago
    function onClientPay()
    {
        const {date, months, price} = payInfo;
        const qDate = toSqliteDate(date);
        
        // Ejecutar consulta
        db.transaction(async tx =>
        {
            const query =
            `
                UPDATE clients 
                SET
                    payDate = JULIANDAY(DATE('${qDate}')),
                    nextPayDate = JULIANDAY(DATE('${qDate}', '+${months} month'))
                WHERE
                    id = ?
            `;
            tx.executeSql(query, [client.id], (_, res) =>
            {
                // Crear nuevo pago
                const payQuery = `INSERT INTO payments (price, date, client_id) VALUES (?, ?, ?)`;
                tx.executeSql(payQuery, [price, qDate, client.id], (_, res) => 
                {
                    ToastAndroid.showWithGravity("Pago agregado correctamente", ToastAndroid.SHORT, ToastAndroid.CENTER); // Mostrar toast
                }, 
                (error, _) => 
                {
                    ToastAndroid.showWithGravity(error.toString(), ToastAndroid.LONG, ToastAndroid.BOTTOM);
                });
            });
        }, (error, _) =>
        {
            ToastAndroid.showWithGravity(error.toString(), ToastAndroid.LONG, ToastAndroid.BOTTOM);
        });

        // Actualizar información del cliente
        db.transaction(tx => 
        {
            tx.executeSql("SELECT *, DATE(JULIANDAY(payDate)) AS fPayDate, DATE(JULIANDAY(nextPayDate)) AS fNextPayDate FROM clients WHERE id = ?", [clientId], (_, res) => 
            {
                const data = res.rows._array[0];
                setClient(data);
            }, 
            (_, error) => 
            {
                ToastAndroid.showWithGravity(error.toString(), ToastAndroid.LONG, ToastAndroid.BOTTOM);
            });
        });
    }

    // Eliminar cliente
    function onDeleteClient()
    {
        const query = "DELETE FROM clients WHERE id = ?";
        db.transaction(tx =>
        {
            tx.executeSql(query, [clientId], (_, res) =>
            {
                navigation.goBack();
                ToastAndroid.showWithGravity("Cliente eliminado", ToastAndroid.SHORT, ToastAndroid.CENTER);
            });
        });
    }

    // Cargar configuraciones
    const loadSettings = async () =>
    {
        const feePriceValue = await AsyncStorage.getItem(Settings.feePrice);
        const inactiveAfterDaysValue = await AsyncStorage.getItem(Settings.inactiveClientAfterDays);

        setFeePrice(feePriceValue);
        setInactiveAfterDays(inactiveAfterDaysValue);
    }


    return (
        <View style={styles.container}>
            {client &&
                <ScrollView> 
                    <Pressable style={styles.inputGroup} onPress={() => inputName.current.focus()}>
                        <Ionicons style={styles.formLabel} name="person-sharp"/>
                        <TextInput style={styles.formControl} onChangeText={(name) => setClient({...client, name: name})} value={client.name} ref={inputName} onSubmitEditing={() => inputPhone.current.focus()} blurOnSubmit={false} autoCapitalize="words" placeholder="Nombre" placeholderTextColor="#888" maxLength={32}></TextInput>
                    </Pressable>
            
                    <Pressable style={styles.inputGroup} onPress={() => inputPhone.current.focus()}>
                        <Ionicons style={styles.formLabel} name="call"/>
                        <TextInput style={styles.formControl} onChangeText={(phone) => setClient({...client, phone: phone})} value={client.phone} ref={inputPhone} keyboardType="numeric" placeholder="Teléfono" placeholderTextColor="#888"></TextInput>
                    </Pressable>

                    <View style={styles.btnWrapper}>
                        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
                            <Text style={styles.btnText}>Cancelar</Text>
                        </Pressable>

                        <Pressable style={styles.btn} onPress={onEditClient}>
                            <Text style={styles.btnText}>Guardar</Text>
                        </Pressable>
                    </View>

                    <View style={styles.lineSeparator}></View>

                    <Text style={{marginStart: 14, marginBottom: 4, fontSize: 24, color: "white"}}>Cuota</Text>

                    <View style={styles.clientInfo_container}>
                        <View style={styles.clientInfo_resume}>
                            <View style={{flex: 1}}>
                                <Text style={styles.clientInfo_header}>Estado</Text>
                                <Text style={styles.clientInfo_text}>{client.status ?? "Cargando..."}</Text>
                            </View>

                            <View style={{flex: 1}}>
                                <Text style={styles.clientInfo_header}>Pagó</Text>
                                <Text style={styles.clientInfo_text}>{formatSqliteDate(client.fPayDate)}</Text>
                            </View>

                            <View style={{flex: 1}}>
                                { (julianDay - client.nextPayDate <= 0) ? 
                                    <View>
                                        <Text style={styles.clientInfo_header}>Vence</Text>
                                        <Text style={styles.clientInfo_text}>{formatSqliteDate(client.fNextPayDate)}</Text>
                                        <Text style={{marginTop: 8, fontSize: 12, textAlign: "center", color: "#ccc"}}>
                                            (En {(client.nextPayDate - julianDay)} días)
                                        </Text>
                                    </View>
                                :
                                    <View>
                                        <Text style={styles.clientInfo_header}>Venció</Text>
                                        <Text style={styles.clientInfo_text}>{formatSqliteDate(client.fNextPayDate)}</Text>
                                        <Text style={{marginTop: 8, fontSize: 12, textAlign: "center", color: "#ccc"}}>
                                            (Hace {(julianDay - client.nextPayDate)} días)
                                        </Text>
                                    </View>
                                }
                            </View>
                        </View>

                        <TouchableOpacity style={styles.clientInfo_payBtn} onPress={() => setShowPayModal(true)}>
                            <FontAwesome5 name="plus-circle" style={styles.clientInfo_payIcon}/>
                            <Text style={styles.clientInfo_payText}>Renovar cuota</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.deleteBtn} 
                        onPress={() => {
                            Alert.alert(
                                "¿Eliminar cliente?", 
                                "Esta acción es irreversible", 
                                [
                                    {text: 'Cancelar', onPress: () => {}},
                                    {text: 'Eliminar', onPress: () => onDeleteClient()},
                                ]);
                        }}>
                        <FontAwesome5 name="trash-alt" style={styles.deleteBtn_icon}/>
                        <Text style={styles.deleteBtn_text}>Eliminar</Text>
                    </TouchableOpacity>


                    {/* Modal de pago */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showPayModal}
                        onRequestClose={() => { setShowPayModal(false); }}
                    >
                        <View style={styles.payModalWrapper}>
                            <View style={styles.payModalCard}>
                                <Text style={styles.payModal_headerText}>Renovar cuota</Text>

                                <View style={styles.payModal_modalContainer}>
                                    <Text style={styles.payModal_payDataText}>Fecha</Text>

                                    <TouchableOpacity style={styles.payModal_modal} onPress={() => setShowCalendar(true)}>
                                        { (payInfo.date == formatISODate(new Date().toISOString())) && <Text style={{color: "white", fontSize: 20}}>{payInfo.date}</Text>}
                                        { (payInfo.date != formatISODate(new Date().toISOString())) && <Text style={{color: "yellow", fontSize: 20}}>{payInfo.date}</Text>}
                                        <FontAwesome5 name="caret-down" style={styles.filterModal_modalIcon}/> 
                                    </TouchableOpacity>

                                    {showCalendar && (
                                        <RNDateTimePicker 
                                            value={new Date()} 
                                            mode="date" 
                                            onChange={(info, date) => onCalendarChange(info, date)}>
                                        </RNDateTimePicker>
                                    )}
                                </View>

                                <View style={styles.payModal_modalContainer}>
                                    <Text style={styles.payModal_payDataText}>Meses</Text>
                                    
                                    <View style={styles.payModal_modal}>
                                        <View style={styles.payModal_formGroup}>
                                            <Ionicons style={styles.payModal_formLabel} name="time"/>
                                            <TextInput style={styles.payModal_formInput} onChangeText={(months) => setPayInfo({...payInfo, months: months})} value={payInfo.months}></TextInput>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.payModal_modalContainer}>
                                    <Text style={styles.payModal_payDataText}>Total</Text>
                                    
                                    <View style={styles.payModal_modal}>
                                        <View style={styles.payModal_formGroup}>
                                            <Ionicons style={styles.payModal_formLabel} name="logo-usd"/>
                                            <TextInput style={styles.payModal_formInput} onChangeText={(price) => setPayInfo({...payInfo, price: price})} value={payInfo.price}></TextInput>
                                        </View>
                                    </View>
                                </View>


                                <View style={styles.payModal_actionBtns}>
                                    <TouchableOpacity style={styles.payModal_actionBtn} onPress={() => {setShowPayModal(false), setShowCalendar(false)}}>
                                        <Text style={styles.payModal_actionBtnText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.payModal_actionBtn} onPress={() => {setShowPayModal(false), setShowCalendar(false), onClientPay()}}>
                                        <Text style={styles.payModal_actionBtnText}>Renovar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            }
        </View>
    );
}


function formatISODate(date)
{
    if(typeof date != "string") date = date.toString();

    const tmp = date.split("T");
    const s = tmp[0].split("-");
    return `${s[2]}/${s[1]}/${s[0]}`;
}

function formatSqliteDate(date)
{
    if(typeof date != "string") date = date.toString();
    
    const s = date.split("-");
    return `${s[2]}/${s[1]}/${s[0]}`;
}

function toSqliteDate(date)
{
    if(typeof date != "string") date = date.toString();

    const s = date.split("/");
    return `${s[2]}-${s[1]}-${s[0]}`; 
}
