import { StyleSheet } from "react-native";


export const colors =
{
    background: "#222",
    foreBackground: "#333",

    primary: "orange",
    secondary: "white",
    muted: "#ccc"
};

export const styles = StyleSheet.create(
{
    container:
    {
        flex: 1, 
        paddingTop: 16, 
        paddingBottom: 0, 
        paddingHorizontal: 16,
        backgroundColor: colors.background,
    },


    // Pantalla first launch
    firstLaunch_container:
    {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    firstLaunch_h1:
    {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    firstLaunch_text:
    {
        fontSize: 16,
        textAlign: "center",
        color: "white",
    },
    firstLaunch_priceInputContainer:
    {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
    },
    firstLaunch_priceInput:
    {
        paddingBottom: 1,
        fontSize: 24,
        color: "white",
    },
    firstLaunch_startContainer:
    {
        marginTop: 16,
        padding: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    firstLaunch_startText:
    {
        fontSize: 24,
        color: "white",
        letterSpacing: 1,
        textTransform: "uppercase",
    },

    // Barra de busqueda
    searchBarContainer:
    {
        flexDirection: "row",
        alignItems: "center",
    },
    searchBar:
    {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",

        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.foreBackground,
        borderRadius: 8,
    },
    searchBar_Icon:
    {
        marginEnd: 8,
        fontSize: 16,
        color: "#888",
    },
    searchBar_Input:
    {
        flex: 1,
        fontSize: 16,
        color: "white",
        textDecorationLine: "none"
    },
    searchBar_filterText:
    {
        marginTop: 4,
        color: colors.muted,
    },
    searchFilter_btn:
    {
        marginStart: 8,
    },
    searchFilter_icon:
    {
        fontSize: 32,
        color: "#ccc",
    },

    // Modal de filtro de busqueda
    filterModalWrapper:
    {
        flex: 1,
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "#00000088",
    },
    filterModalCard:
    {
        width: "85%",
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 4,
    },

    filterModal_headerText:
    {
        marginBottom: 16,
        fontSize: 20,
        fontWeight: "500",
        color: "white",
    },

    filterModal_filter:
    {
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    filterModal_filterText:
    {
        flex: 1,
        color: "#ccc",
    },
    filterModal_modal:
    {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterModal_modalIcon:
    {
        fontSize: 24,
        color: "white"
    },

    filterModal_actionBtns:
    {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    filterModal_actionBtn:
    {
        marginStart: 8,
        padding: 8,
    },  
    filterModal_actionBtnText:
    {
        color: "white",
        textTransform: "uppercase"
    },  


    // Inputs
    inputGroup:
    {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFFFFF15",
        borderRadius: 8,
        
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    formLabel:
    {
        width: 35,
        color: "orange",
        fontSize: 18,
    },
    formControl:
    {
        flex: 1,
        color: "white",
        fontSize: 18,
    },


    // Informacion de cliente
    clientInfo_container:
    {
        backgroundColor: "#333",
        borderRadius: 8,
        padding: 16,
    },
    clientInfo_resume:
    {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    clientInfo_header:
    {
        fontSize: 16,
        textAlign: "center",
        textTransform: "uppercase",
        color: "#ccc",
        letterSpacing: 1,
    },
    clientInfo_text:
    {
        marginTop: 8,
        fontSize: 16,
        textAlign: "center",
        color: "white",
        fontWeight: "bold", 
    },
    clientInfo_payBtn:
    {
        marginTop: 20,
        padding: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderRadius: 4,
        borderColor: "orange",
    },
    clientInfo_payIcon:
    {
        marginEnd: 8,
        fontSize: 20,
        color: "orange",
    },
    clientInfo_payText:
    {
        fontSize: 20,
        color: "orange",
    },

    deleteBtn:
    {
        marginTop: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",

        backgroundColor: "#B90E0A",
        borderRadius: 8,
    },
    deleteBtn_icon:
    {
        marginEnd: 8,
        fontSize: 16,
        color: "white",
    },
    deleteBtn_text:
    {
        fontSize: 16,
        color: "white",
    },


    // Tarjeta de cliente
    clientCard_container:
    {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: 24,
    }, 
    clientCard_body:
    {
        marginLeft: 16,
        flex: 1,
    },

    clientCard_iconWrapper:
    {
        justifyContent: "center",
        alignItems: "center",
        width: 52,
        height: 52,
        borderWidth: 1,
        borderColor: "#555",
        borderRadius: 52 / 2,
    },  
    clientCard_icon:
    {
        fontSize: 24,
    },

    clientCard_name:
    {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },

    clientCard_dataWrapper:
    {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    clientCard_data:
    {
        flexDirection: "row",
        alignItems: "center",
    },
    clientCard_dataIcon:
    {
        marginEnd: 8,
        color: "#ccc"
    },
    clientCard_dataText:
    {
        marginEnd: 8,
        color: "#ccc",
    },

    
    // Inicio
    stats_card:
    {
        marginBottom: 16,
        padding: 16,
        backgroundColor: "#333", 
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#555",
    },
    stats_headerText:
    {
        textTransform: "uppercase",
        textAlign: "left",
        marginBottom: 8, 
        fontSize: 16,
        letterSpacing: 1, 
        color: "white",
    },
    stats_clientsCard:
    {
        flexDirection: "row",
        justifyContent: "center",
    }, 
    stats_clientsCard_container:
    {
        marginHorizontal: 12,
        alignItems: "center",
    },
    stats_clientsCard_header:
    {
        textTransform: "uppercase",
        color: "white",
    },
    stats_clientsCard_text:
    {
        fontSize: 24,
        letterSpacing: 1,
        fontWeight: "bold",
        color: "orange",
    },

    stats_cardResumes:
    {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    stats_cardResume:
    {
        flex: 1,
        alignItems: "center",
    },
    stats_cardResume_header:
    {
        paddingBottom: 4,
        fontSize: 16,
        fontWeight: "500",
        color: "orange",
        textTransform: "uppercase",
        letterSpacing: 2,

        borderBottomColor: "#555",
        borderBottomWidth: 1,
    },
    stats_cardResume_text:
    {
        fontSize: 24,
        fontWeight: "500",
        color: "white",
    },

    stats_cardResume_paymentsWrapper:
    {
        padding: 8,
        backgroundColor: "#444",
        borderRadius: 4,
    },
    stats_cardResume_payment:
    {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
        paddingTop: 4,
        borderTopColor: "#555",
        borderTopWidth: 1,
    },
    stats_cardResume_paymentText:
    {
        marginEnd: 8,
        color: "white",
    },

    // Boton de pago
    payModalWrapper: 
    {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000088"
    },
    payModalCard: 
    {
        width: "85%",
        padding: 16,
        backgroundColor: "#222",
        borderRadius: 4,
    },

    payModal_headerText:
    {
        marginBottom: 16,
        fontSize: 20,
        fontWeight: "500",
        color: "white",
    },

    payModal_modalContainer:
    {
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    payModal_payDataText:
    {
        flex: 1,
        color: "#ccc"
    },
    payModal_modal:
    {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterModal_modalIcon:
    {
        fontSize: 24,
        color: "white"
    },

    payModal_formGroup:
    {
        paddingHorizontal: 8,

        flexDirection: "row",
        alignItems: "center",

        padding: 4,
        backgroundColor: "#333",
        borderRadius: 8,
    },
    payModal_formLabel:
    {
        marginEnd: 8,
        fontSize: 18,
        color: "orange",
    },
    payModal_formInput:
    {
        flex: 1,

        fontSize: 18,
        color: "white",
        textDecorationLine: "none",
    },

    payModal_actionBtns:
    {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    payModal_actionBtn:
    {
        marginStart: 8,
        padding: 8,
    },  
    payModal_actionBtnText:
    {
        color: "white",
        textTransform: "uppercase"
    },

    // Botones "Guardar/Cancelar"
    btnWrapper:
    {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    btn:
    {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
    },
    btnText:
    {
        color: "orange",
        fontSize: 24,
    },

    lineSeparator:
    {
        marginVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#555",
    }, 

    // Boton flotante
    floatingBtn_container:
    {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: "orange",
        borderRadius: 64 / 2,

        elevation: 4,
        shadowColor: "black",
    },
    floatingBtn_icon:
    {
        color: "white",
        fontSize: 32,
    },


    // ModalSelector
    ModalSelector_style:
    {
        flex: 1,
    },
    ModalSelector_headerStyle:
    {
        marginBottom: 8,
        textAlign: "center", 
        fontWeight: "500", 
        fontSize: 16, 
        color: "#222"
    },
    ModalSelector_optionContainerStyle:
    {
        backgroundColor: "#eee", 
        borderRadius: 0, 
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
    },

    ModalSelector_cancelContainerStyle:
    {
        backgroundColor: "#eee",
        borderRadius: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    ModalSelector_selectStyle:
    {
        padding: 0,
        borderWidth: 0,
    },
    ModalSelector_initValueTextStyle:
    {
        textAlign: "left",
        color: "#888",
        fontSize: 18,
    },
    ModalSelector_selectTextStyle:
    {
        textAlign: "left",
        color: "white",
        fontSize: 18,
    },

    // Icons
    ionicons_caretDown:
    {
        color: "#ccc",
        fontSize: 22,
    }
});