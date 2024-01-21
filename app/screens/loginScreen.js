import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { initializeApp } from 'firebase/app'
import React, { useState } from 'react';
import { firebaseConfig } from '../../utils/firebase-config';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Alert } from 'react-native';
import { ImageBackground } from 'react-native';
import { Image } from 'react-native';
import { useAuth } from './AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loading from '../components/Loading';

export const LoginScreen = () => {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const { login } = useAuth();
    const navigation = useNavigation();

    const handleSignIn = async () => {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userType = await getUserType(user.uid);

            login(user, userType);
            navigation.navigate('Home');
            console.log('El usuario es tipo: ' + userType)

        } catch (error) {
            console.log("Error al iniciar sesión:", error.message);
            Alert.alert("Error", "Correo o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    }

    const handleForgotPassword = async () => {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            Alert.alert("Éxito", "Se ha enviado un correo para restablecer la contraseña");
        } catch (error) {
            console.log("Error al enviar correo de recuperación:", error.message);
            Alert.alert("Error", "No se pudo enviar el correo de recuperación. Verifica tu dirección de correo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Image source={require('../../assets/fondo.jpg')} style={styles.container} />
            <View style={styles.body}>
                <View style={{ flex: 0.5, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>INICIO DE SESIÓN</Text>
                </View>

                <View style={{ alignItems: 'center', flex: 2 }}>
                    <Text style={styles.text}>Email</Text>
                    <TextInput style={styles.input} placeholder='alguien@gmail.com' onChangeText={(text) => setEmail(text)} />

                    <Text style={styles.text}>Contraseña</Text>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} placeholder='Contraseña' secureTextEntry={!showPassword} onChangeText={(text) => setPassword(text)} />
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                        <Text style={{ color: '#E5690E' }}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <View style={{ marginBottom: 30, flexDirection: 'row', marginTop: 20 }}>
                        <TouchableOpacity style={styles.Button} onPress={handleSignIn}>
                            <Text style={{ color: 'white' }}>Iniciar Sesión</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.Button1} onPress={() => { navigation.navigate('Register') }}>
                            <Text style={{ color: 'white' }}>Crear Cuenta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Loading visible={loading} text="Iniciando sesión..." />
        </View>
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

    }, inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        marginBottom: 20,
    },
    forgotPasswordButton:{


    },
});