import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons'; 
import { useNavigation } from "@react-navigation/native";
import { styles } from "../utils";


export default function Client({clientId, name, status})
{
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.clientCard_container} onPress={() => navigation.navigate("Información de cliente", {clientId: clientId})}>
            <View style={styles.clientCard_iconWrapper}>
                { (status == 0) && <FontAwesome5 name="user-alt" style={[styles.clientCard_icon, {color: "white"}]}/> }
                { (status == 1) && <FontAwesome5 name="user-clock" style={[styles.clientCard_icon, {color: "#ccc"}]}/> }
                { (status == 2) && <FontAwesome5 name="user-times" style={[styles.clientCard_icon, {color: "#555"}]}/> }
            </View>

            <View style={styles.clientCard_body}>
                <Text style={styles.clientCard_name}>{name}</Text>

                <View style={styles.clientCard_dataWrapper}>
                    {/* <View style={[styles.clientCard_data, {flex: 3}]}>
                        <FontAwesome5 name="chalkboard-teacher" style={styles.clientCard_dataIcon}/>
                        <Text style={styles.clientCard_dataText}>{teacherName ?? "(Sin profesor)"}</Text>
                    </View> */}

                    <View style={[styles.clientCard_data, {flex: 2}]}>
                        <FontAwesome5 name="money-check" style={styles.clientCard_dataIcon}/>

                        { (status == 0) && <Text style={styles.clientCard_dataText}>Activo</Text> }
                        { (status == 1) && <Text style={styles.clientCard_dataText}>Pendiente</Text> }
                        { (status == 2) && <Text style={styles.clientCard_dataText}>Inactivo</Text> }
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
