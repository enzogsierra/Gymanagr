import React, {useCallback, useEffect, useState} from "react";
import {View, Pressable, Text, ScrollView, ToastAndroid} from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import {Ionicons} from '@expo/vector-icons'; 

import {db} from "../dbConfig"; // Importar la db
import ModalSelector from "react-native-modal-selector";
import {colors, styles} from "../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../settings";


export default function HomeScreen()
{
    const [julianDay, setJulianDay] = useState();
    const [inactiveAfterDays, setInactiveAfterDays] = useState(0); // settings.js

    const [clients, setClients] = useState();
    const [payments, setPayments] = useState();
    const [months, setMonths] = useState();
    const [filters, setFilters] = useState();

    const [showMonthsModal, setShowMonthsModal] = useState(false);


    // Cuando la pantalla entre en focus
    useFocusEffect(useCallback(() =>
    {
        // Cargar configuraciones
        loadSettings();

        // Obtener JULIANDAY
        db.transaction(tx => 
        {
            tx.executeSql("SELECT JULIANDAY(DATE('NOW')) AS julianday", [], (_, res) => 
            {
                setJulianDay(res.rows._array[0].julianday);
            });
        });


        // Cargar lista de meses
        const curMonth = new Date().getMonth() + 1; // Mes actual (MM)
        const curYear = new Date().getFullYear(); // Año actual (yyyy)
        let list = [];

        for(let i = 0; i < 12; i++) // Iterar sobre los ultimos 12 meses
        {
            const month = curMonth - i;

            if(month >= 1) list.push({key: i, label: `${getMonthName(month)}`, value: `${pad(month)}/${curYear}`}); // Nombre del mes
            else list.push({key: i, label: `${getMonthName(month + 12)}, ${curYear - 1}`, value: `${pad(month + 12)}/${curYear - 1}`}); // Nombre del mes + año (actual - 1)
        }
        setMonths(list);


        // Filtros
        setFilters({date: list[0].value});
        

        //
        setShowMonthsModal(false);
    }, []));


    // Cuando cambian los filtros
    useEffect(() =>
    {
        if(!filters) return;

        // Obtener clientes
        db.transaction(tx => 
        {
            let query = 
            `
                SELECT nextPayDate 
                FROM clients
            `;

            tx.executeSql(query, [], (_, res) => 
            {
                setClients(res.rows._array);
            },
            (_, error) => 
            {
                ToastAndroid.showWithGravity(error.toString(), ToastAndroid.SHORT, ToastAndroid.CENTER);
            });
        });


        // sql
        let query = 
        `
            SELECT 
                payments.id, 
                payments.date, 
                payments.price,
                clients.name AS clientName
            FROM 
                payments
            LEFT JOIN clients ON 
                payments.client_id = clients.id
            WHERE 
                strftime('%m/%Y', date) = '${filters.date}'
        `;
        query += " ORDER BY payments.date DESC";


        // Hacer consulta
        db.transaction(tx => 
        {
            tx.executeSql(query, [], (_, res) => 
            {
                setPayments(res.rows._array);
            }, (_, error) => { console.log(error); });
        });
    }, [filters]);


    // Cuando se selecciona una fecha
    function onDateSelect(date)
    {
        setFilters({date: date});
        setShowMonthsModal(false);
    }

     // Cargar configuraciones
     const loadSettings = async () =>
     {
         const inactiveAfterDaysValue = await AsyncStorage.getItem(Settings.inactiveClientAfterDays);
 
         setInactiveAfterDays(inactiveAfterDaysValue);
     }


    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.home_headerText}>Clientes</Text>
                <View style={styles.home_card}>
                    { payments &&
                        <View style={styles.home_clientsCard}>
                            <View style={styles.home_clientsCard_container}>
                                <Text style={styles.home_clientsCard_text}>{clients.reduce((a, b) => a + ((julianDay - b.nextPayDate <= 0) ? 1 : 0), 0)}</Text>
                                <Text style={styles.home_clientsCard_header}>Activos</Text>
                            </View>

                            <View style={styles.home_clientsCard_container}>
                                <Text style={styles.home_clientsCard_text}>{clients.reduce((a, b) => a + ((julianDay - b.nextPayDate > 0 && julianDay - b.nextPayDate <= inactiveAfterDays) ? 1 : 0), 0)}</Text>
                                <Text style={styles.home_clientsCard_header}>Pendientes</Text>
                            </View>

                            <View style={styles.home_clientsCard_container}>
                                <Text style={styles.home_clientsCard_text}>{clients.reduce((a, b) => a + ((julianDay - b.nextPayDate > inactiveAfterDays) ? 1 : 0), 0)}</Text>
                                <Text style={styles.home_clientsCard_header}>Inactivos</Text>
                            </View>

                            <View style={styles.home_clientsCard_container}>
                                <Text style={styles.home_clientsCard_text}>{clients.length}</Text>
                                <Text style={styles.home_clientsCard_header}>Total</Text>
                            </View>
                        </View>
                    }
                </View>


                <Text style={styles.home_headerText}>Resumen</Text>
                <View style={styles.home_card}>
                    <Pressable style={styles.inputGroup} onPress={() => setShowMonthsModal(true)}>
                        <Ionicons style={styles.formLabel} name="calendar"/>

                        <ModalSelector
                            data={months}
                            selectedKey={0}
                            visible={showMonthsModal}
                            initValue="Mes"
                            header={<Text style={styles.ModalSelector_headerStyle}>Ver pagos hechos en</Text>}
                            cancelText="Cancelar"
                            
                            style={styles.ModalSelector_style}
                            selectStyle={styles.ModalSelector_selectStyle}
                            initValueTextStyle={styles.ModalSelector_initValueTextStyle}
                            selectTextStyle={styles.ModalSelector_selectTextStyle}
                            optionContainerStyle={styles.ModalSelector_optionContainerStyle}
                            cancelContainerStyle={styles.ModalSelector_cancelContainerStyle}
                            
                            onChange={(date) => onDateSelect(date.value)}
                            onModalClose={() => setShowMonthsModal(false)}
                        />

                        <Ionicons name="caret-down" size={16} color="white"/>
                    </Pressable>

                    { payments &&
                        <View style={styles.home_cardResumes}>
                            <View style={styles.home_cardResume}>
                                <Text style={styles.home_cardResume_header}>Pagos</Text>
                                <Text style={styles.home_cardResume_text}>{payments.length}</Text>
                            </View>

                            <View style={styles.home_cardResume}>
                                <Text style={styles.home_cardResume_header}>Ingresos</Text>
                                <Text style={styles.home_cardResume_text}>$ {formatCurrency(payments.reduce((a, b) => a + b.price, 0))}</Text>
                            </View>
                        </View>
                    }

                    <View style={{marginVertical: 16, borderTopWidth: 1, borderTopColor: "#555"}}></View>

                    <Text style={{marginBottom: 8, fontSize: 16, color: "#ccc"}}>Historial de pagos</Text>
                    <View style={styles.home_cardResume_paymentsWrapper}>
                        {(payments && !payments.length) &&
                            <Text style={{flex: 1, textAlign: "center", color: "#ccc"}}>No se encontraron pagos. Intenta con otros términos.</Text>
                        }

                        {payments && payments.map((payment, index) =>
                        {
                            return (
                                <View key={payment.id} style={[styles.home_cardResume_payment, (index == 0) ? {marginTop: 0, paddingTop: 0, borderTopWidth: 0} : {}]}>
                                    <Text style={[styles.home_cardResume_paymentText, {color: colors.primary, fontWeight: "bold"}]}>{formatSqliteDate(payment.date)}</Text>
                                    <Text style={[styles.home_cardResume_paymentText, {flex: 1}]}>{payment.clientName ?? "(Sin cliente)"}</Text>
                                    <Text style={[styles.home_cardResume_paymentText, {marginEnd: 0}]}>$ {formatCurrency(payment.price)}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}


function getMonthName(month) // Self explanatory
{
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[month - 1];
}

function pad(number) // Adds leading zero
{
    return ('0' + number).slice(-2); 
}

function formatCurrency(number) 
{
    let parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
}

function formatSqliteDate(date)
{
    if(typeof date != "string") date = date.toString();
    
    const s = date.split("-");
    return `${s[2]}/${s[1]}/${s[0]}`;
}