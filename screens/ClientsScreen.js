import React, {useEffect, useState} from "react";
import {View, Text, ScrollView, TextInput, Modal, Pressable, ToastAndroid, TouchableOpacity} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {FontAwesome, Ionicons} from '@expo/vector-icons';

import Client from "../components/Client";
import {db} from "../dbConfig"; // Importar la db
import ModalSelector from "react-native-modal-selector";
import { colors, styles } from "../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../settings";


export default function ClientsScreen()
{
    const navigation = useNavigation();

    const [searchFilters, setSearchFilters] = useState({}); // Almacena los filtros de búsqueda de clientes

    const [showStatusList, setShowStatusList] = useState(false); // ^

    const [clients, setClients] = useState([]); // Almacena todos los clientes - inmutable
    const [clientsList, setClientsList] = useState([]); // Almacena la lista de clientes (puede cambiar al cambiar los filtros de busqueda)
    const [statusList, setStatusList] = useState([]); // Almacena los estados de cuenta

    const [julianDay, setJulianDay] = useState(0); // Almacena el dia juliano actual (hoy)
    const [inactiveAfterDays, setInactiveAfterDays] = useState(0); // settings.js


    // Cuando carga la aplicacion
    useEffect(() =>
    {
        // Limpiar filtros de busqueda
        setSearchFilters({name: "", status: 0});
    }, []);


    // Cuando la pantalla esté en foco
    useFocusEffect(React.useCallback(() =>
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

        // Obtener clientes
        db.transaction(tx =>
        {
            const query =
            `
                SELECT
                    clients.id,
                    clients.name,
                    clients.nextPayDate,
                    DATE(JULIANDAY(clients.nextPayDate)) AS fNextPayDate
                FROM clients
                ORDER BY clients.name ASC
            `;
            tx.executeSql(query, [], (_, res) =>
            {
                setClients(res.rows._array); // Almacenar todos los clientes
            });
        });

        // Crear estados de cuenta
        setStatusList(
        [
            {key: 0, label: "Activos y Pendientes"}, // Incluye los usuarios al día y pendientes de pago
            {key: 1, label: "Solo Pendientes"}, // Solamente los pendientes de pago
            {key: 2, label: "Inactivos"}, // Solamente clientes con pagos inactivos
            {key: 3, label: "Todos"} // Todos los clientes
        ]);
    }, []));


    // Cuando se actualiza el filto de busqueda
    useEffect(() =>
    {
        let list = clients;
        const {name, status} = searchFilters;

        if(name) // El filtrado por nombre no toma en cuenta los demas filtros (filtra entre todos los clientes)
        {
            list = list.filter(client =>
            {
                return client.name.toLowerCase().indexOf(name.trim().toLowerCase()) > -1; // Si el nombre del cliente coincide con la busqueda, añadirlo a la nueva lista
            });
        }
        else // Filtrar
        {
            switch(status) // Filtrar por estado de cuenta
            {
                case 0: // Activos
                {
                    list = list.filter(client => { return (parseInt(julianDay - client.nextPayDate) <= inactiveAfterDays); });
                    break;
                }
                case 1: // Pendientes
                {
                    list = list.filter(client => { return (parseInt(julianDay - client.nextPayDate) >= 0 && parseInt(julianDay - client.nextPayDate) <= inactiveAfterDays); });
                    break;
                }
                case 2: // Inactivos
                {
                    list = list.filter(client => { return (parseInt(julianDay - client.nextPayDate) > inactiveAfterDays); });
                    break;
                }
                default: break; // Todos
            }
        }

        setClientsList(list);
    }, [clients, searchFilters]);


    // Cargar configuraciones
    const loadSettings = async () =>
    {
        const inactiveAfterDaysValue = await AsyncStorage.getItem(Settings.inactiveClientAfterDays);

        setInactiveAfterDays(inactiveAfterDaysValue);
    }


    return (
        <View style={styles.container}>
            <View style={styles.searchBarContainer}>
                <View style={styles.searchBar}>
                    <FontAwesome name="search" style={styles.searchBar_Icon} />

                    <TextInput
                        style={styles.searchBar_Input}
                        placeholder="Buscar cliente"
                        onChangeText={(name) => setSearchFilters({...searchFilters, name: name})}
                        value={searchFilters.name}
                        placeholderTextColor="#888"
                    />
                </View>

                <TouchableOpacity style={styles.searchFilter_btn} onPress={() => setShowStatusList(true)}>
                    <Ionicons style={styles.searchFilter_icon} name="options"/>
                </TouchableOpacity>

                <ModalSelector
                    data={statusList}
                    selectedKey={searchFilters.status}
                    visible={showStatusList}
                    header={<Text style={styles.ModalSelector_headerStyle}>Mostrar clientes</Text>}
                    cancelText="Cancelar"

                    selectStyle={{display: "none", borderWidth: 0}}
                    initValueTextStyle={styles.ModalSelector_initValueTextStyle}
                    selectTextStyle={styles.ModalSelector_selectTextStyle}
                    optionContainerStyle={styles.ModalSelector_optionContainerStyle}
                    cancelContainerStyle={styles.ModalSelector_cancelContainerStyle}

                    onChange={(status) => setSearchFilters({...searchFilters, status: status.key})}
                    onModalClose={() => setShowStatusList(false)}
                />
            </View>

            {(searchFilters && (searchFilters.name != "" || searchFilters.status != 0)) &&
                <Text style={styles.searchBar_filterText}>{clientsList.length} {(clientsList.length == 1) ? ("cliente filtrado") : ("clientes filtrados")}</Text>
            }

            {!clients.length ?
                <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                    <Text style={{fontSize: 16, color: colors.muted}}>Añade clientes presionando en </Text>
                    <Ionicons name="person-add-sharp" style={{fontSize: 16, color: "white", backgroundColor: colors.primary, padding: 4, borderRadius: 50}}/>
                </View>
            :
                <ScrollView style={{marginTop: 16}}>
                {
                    // Mostrar la lista de clientes (completa o filtrada)
                    clientsList.map(client =>
                    {
                        // Obtener "status" de cuota
                        let status = 0;
                        const diff = parseInt(julianDay - client.nextPayDate);

                        if(diff > inactiveAfterDays) status = 2; // servicio inactivo
                        else if(diff > 0) status = 1; // servicio pendiente
                        else if(diff <= 0) status = 0; // serivicio activo

                        return (
                            <Client
                                key={client.id}
                                clientId={client.id}
                                name={client.name}
                                status={status}
                            />
                        );
                    })
                }
                </ScrollView>
            }

            <TouchableOpacity style={styles.floatingBtn_container} onPress={() => navigation.navigate("Añadir cliente")} activeOpacity={0.75}>
                <Ionicons name="person-add-sharp" style={styles.floatingBtn_icon}/>
            </TouchableOpacity>
        </View>
    );
}
