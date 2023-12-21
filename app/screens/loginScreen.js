import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { initializeApp } from 'firebase/app'
import React, { useState } from 'react';
import { firebaseConfig } from '../../utils/firebase-config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';
import { ImageBackground } from 'react-native';
import { Image } from 'react-native';
import { useAuth } from './AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';



export const loginScreen = () => {

    //variables para el loguin
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false); // Nuevo estado

    const togglePasswordVisibility = () => {
        // Cambia el estado para mostrar u ocultar la contraseña
        setShowPassword(!showPassword);
    };
    

    const { login } = useAuth();

    const handleSignIn = async () => {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Obtener el userType desde Firestore
            const userType = await getUserType(user.uid);

            // Almacenar en el contexto
            login(user, userType);

            navigation.navigate('Home');
            console.log('El usuario es tipo: ' + userType)

        } catch (error) {
            console.log("Error al iniciar sesión:", error.message);
            Alert.alert(error.message);

        }

    }


    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <Image source={require('../../assets/fondo.jpg')} style={styles.container} />
            <View style={styles.body}>
                <View style={{ flex: 0.5, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, }}>INICIO DE SESION</Text>
                </View>

                <View style={{ alignItems: 'center', flex: 2 }}>

                    <Text style={styles.text}>Email</Text>
                    <TextInput style={styles.input} placeholder='alguien@gmail.com' onChangeText={(text) => setEmail(text)}  >
                    </TextInput>

                    <Text style={styles.text}>Contraseña</Text>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} placeholder='Contraseña' onChangeText={(text) => setPassword(text)} keyboardType='visible-password' secureTextEntry={!showPassword}>
                        </TextInput>
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#333" />
                        </TouchableOpacity>
                    </View>



                    <View style={{ marginBottom: 30, flexDirection: 'row', marginTop: 20 }}>

                        <TouchableOpacity style={styles.Button} onPress={handleSignIn}>
                            <Text style={{ color: 'white' }}>Iniciar Sesion</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.Button1} onPress={() => { navigation.navigate('Register') }}>
                            <Text style={{ color: 'white' }}>Crear Cuenta</Text>
                        </TouchableOpacity>

                    </View>

                </View>


            </View>
        </View >
    );
};

const getUserType = async (userId) => {
    try {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('userId', '==', userId)); // Supongamos que tienes un campo userId en tus documentos
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
            const userType = userSnapshot.docs[0].data().userType;
            return userType;
        } else {
            console.log('Usuario no encontrado en la base de datos');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el userType:', error);
        return null;
    }
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        resizeMode: 'cover', // o 'contain' para ajustar la imagen dentro del componente
        position: 'absolute'
    },
    text: {
        fontSize: 17,
        fontWeight: '400',
        color: 'black'
    },
    input: {

        padding: 10,
        backgroundColor: '#F5EBD6', // Color blanco con opacidad
        borderRadius: 5,

        margin: 25,
        width: 200


    },
    body: {

        flex: 2,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Color blanco con opacidad
        borderRadius: 25,
        color: '#fff', // Color del texto
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 200

    },
    Button: {
        backgroundColor: '#E5690E',
        alignItems: 'center',
        padding: 15,
        borderRadius: 50
    },
    Button1: {
        backgroundColor: '#E61C0E',
        alignItems: 'center',
        padding: 15,
        borderRadius: 50,
        marginLeft: 20,

    },    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        marginBottom: 20,
    },
});