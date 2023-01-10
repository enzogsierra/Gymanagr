// Configuraciones
export const Settings =
{
    feePrice: "feePrice", 
    inactiveClientAfterDays: "inactiveClientAfterDays",
}

// Lista de configuraciones
export const settingsInfo =
[
    {
        key: Settings.feePrice, // Para ser usado en AsyncStorage.setItem("key", value)
        value: 0, // Valor de la key obtenida con AsyncStorage.getItem("key");
        title: "Cuota mensual", // Titulo que se muestra en la lista de configuraciones
        subtitle: "$ {}", // Subtitulo mostrado en la lista de configuraciones, el "{}" luego se cambia por el "value"
        description: "Precio que se cobra mensualmente a los clientes", // Descripcion mostrada al presionar sobre la configuracion
        keyboardType: "numeric", // Tipo de entrada de datos, usado en el TextInput
    },
    {
        key: Settings.inactiveClientAfterDays,
        value: 31,
        title: "Cliente inactivo después de", 
        subtitle: "{} días",
        description: "Cantidad de días desde el vencimiento de la cuota de un cliente. Pasado estos días, el cliente se considerará como inactivo",
        keyboardType: "numeric",
    },
];


// Cargar una configuracion
export const loadSetting = async (key) =>
{
    const value = await AsyncStorage.getItem(key) ?? null;
    return value;
};