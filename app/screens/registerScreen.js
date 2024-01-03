import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import { initializeApp } from 'firebase/app'
import React, { useState } from 'react';
import { firebaseConfig } from '../../utils/firebase-config';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, } from 'firebase/auth';
import { Alert } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

//firestore
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { ImageBackground } from 'react-native';

//Keyboard
import { KeyboardAvoidingView } from 'react-native';

export const RegisterScreen = () => {


    //variables para el loguin
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [nombre, setNombre] = React.useState('');
    const [accType, setAccType] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false); // Nuevo estado

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [nombreError, setNombreError] = useState('');
    const [accTypeError, setAccTypeError] = useState('');

    const togglePasswordVisibility = () => {
        // Cambia el estado para mostrar u ocultar la contraseña
        setShowPassword(!showPassword);
    };


    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleCreateAccount = () => {
        // Validaciones
        if (nombre === '' || !/^[a-zA-Z]+$/.test(nombre)) {
            setNombreError('El nombre no es válido');
            return;
        } else {
            setNombreError('');
        }

        if (email === '' || !email.includes('@')) {
            setEmailError('El correo electrónico no es válido');
            return;
        } else {
            setEmailError('');
        }

        if (password.length < 6 || !/[A-Z]/.test(password)) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres y una mayúscula');
            return;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('La contraseña y la confirmación no coinciden');
            return;
        } else {
            setConfirmPasswordError('');
        }

        if (accType === '') {
            setAccTypeError('Selecciona un tipo de usuario');
            return;
        } else {
            setAccTypeError('');
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                console.log('Creando Cuenta -----------------------------');
                const user = userCredential.user;
                console.log(user);

                // Guardar información adicional en Firestore
                const userData = {
                    name: nombre, // Reemplaza con el nombre real del usuario
                    userType: accType, // Reemplaza con el tipo de usuario
                    email: email,
                    userId: user.uid,

                };

                // Añadir documento a la colección 'users' en Firestore
                const docRef = await addDoc(collection(db, 'users'), userData);
                console.log('Documento agregado con ID: ', docRef.id);

                navigation.navigate('Login');
            })
            .catch(error => {
                console.log("error!!!!!!!!!!!!!!!!!!!!!");
                Alert.alert(error.message);
            });
    };

    //VALIDACIONES

    const isValidName = (name) => /^[a-zA-Z]+$/.test(name);
    const isValidEmail = (email) => email.includes('@');
    const isPasswordValid = (password) => password.length >= 6 && /[A-Z]/.test(password);


    const navigation = useNavigation();

    return (

        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Image source={require('../../assets/fondo.jpg')} style={styles.container} />
                <View style={styles.body}>
                    <View style={styles.formContainer}>
                        <Text style={styles.text}>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Juan'
                            onChangeText={(text) => setNombre(text)}
                        />
                        <Text style={styles.errorText}>{nombreError}</Text>

                        <Text style={styles.text}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='alguien@gmail.com'
                            onChangeText={(text) => setEmail(text)}
                        />
                        <Text style={styles.errorText}>{emailError}</Text>

                        <Text style={styles.text}>Contraseña:</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder='Contraseña'
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                style={styles.iconContainer}
                            >
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.errorText}>{passwordError}</Text>

                        <Text style={styles.text}>Confirmar Contraseña:</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder='Confirmar Contraseña'
                                onChangeText={(text) => setConfirmPassword(text)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                style={styles.iconContainer}
                            >
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.errorText}>{confirmPasswordError}</Text>

                        <Text style={styles.text}>Seleccione: </Text>
                        <SegmentedButtons
                            value={accType}
                            onValueChange={(value) => {
                                setAccType(value);
                                setAccTypeError(''); // Limpiar el mensaje de error cuando se selecciona un tipo de usuario
                            }}
                            buttons={[
                                {
                                    value: '1',
                                    label: 'Chef',
                                },
                                {
                                    value: '2',
                                    label: 'Usuario',
                                },
                            ]}
                        />
                        <Text style={styles.errorText}>{accTypeError}</Text>

                        <View style={{ marginBottom: 30, flexDirection: 'row', marginTop: 20, }}>
                            <TouchableOpacity style={styles.Button} onPress={handleCreateAccount}>
                                <Text style={{ color: 'white' , width: 45,}}>CREAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        resizeMode: 'cover', // o 'contain' para ajustar la imagen dentro del componente
        position: 'absolute'
    },
    text: {
        fontSize: 12,
        fontWeight: '400',
        color: 'black',
    },
    input: {
        padding: 10,
        backgroundColor: '#F5EBD6',
        borderRadius: 5,
        margin: 5,
        width: 200,
    },
    body: {
        flex: 1,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopEndRadius: 25,
        borderTopStartRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10
    },
    buttonContainer: {
        marginTop: 20,
        width: 200,
    },
    Button: {
        backgroundColor: '#E5690E',
        alignItems: 'center',
        padding: 15,
        borderRadius: 50,
        justifyContent: 'center',

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 1,
        marginBottom: 20,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 9,
    },

});