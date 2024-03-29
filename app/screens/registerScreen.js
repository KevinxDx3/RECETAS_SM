import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { initializeApp } from 'firebase/app'
import React, { useState } from 'react';
import { firebaseConfig } from '../../utils/firebase-config';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, } from 'firebase/auth';
import { Alert } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { Image, Modal, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loading from '../components/Loading';

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
    const [acceptTerms, setAcceptTerms] = React.useState(false);
    const [showTermsModal, setShowTermsModal] = React.useState(false);


    const togglePasswordVisibility = () => {
        // Cambia el estado para mostrar u ocultar la contraseña
        setShowPassword(!showPassword);
    };


    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const termsAndConditionsText = `
        TÉRMINOS Y CONDICIONES DE USO

   
        
        Bienvenido a [RecetasSM]. Al acceder y utilizar esta aplicación, aceptas cumplir con estos términos y condiciones de uso. Si no estás de acuerdo con alguno de los siguientes términos, por favor, no utilices la aplicación.
        
        1. USO DE LA APLICACIÓN
        
        1.1 Contenido: La aplicación proporciona [Sistema de gestión de recetas]. Entiendes y aceptas que cualquier contenido, incluyendo recetas y otras informaciones disponibles en la aplicación, es proporcionado por los usuarios y no asumimos responsabilidad por la exactitud, legalidad o idoneidad de dicho contenido.
        
        1.2 Derechos de autor: Los usuarios son responsables de garantizar que el contenido que comparten, incluyendo recetas, cumpla con los derechos de autor y otras leyes aplicables. No nos hacemos responsables por infringir los derechos de autor u otras violaciones legales relacionadas con el contenido compartido por los usuarios.
        
        1.3 Contenido Obsceno: No se permite compartir contenido obsceno, ofensivo o inapropiado. Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado.
        
        2. RESPONSABILIDADES Y EXENCIÓN DE RESPONSABILIDAD
        
        2.1 Uso de Recetas: Las recetas proporcionadas por los usuarios son solo para fines informativos. No asumimos responsabilidad por cualquier daño, lesión o pérdida que pueda surgir del uso de las recetas compartidas en la aplicación.
        
        2.2 Ausencia de Responsabilidad: La aplicación se proporciona "tal cual", sin garantías de ningún tipo. No garantizamos la exactitud, confiabilidad o disponibilidad de la aplicación.
        
        3. MODIFICACIONES
        
        Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en la aplicación. Se recomienda revisar periódicamente estos términos para estar informado de cualquier cambio.
        
        4. DISPOSICIONES FINALES
        
        4.1 Contacto: Si tienes alguna pregunta sobre estos términos y condiciones, contáctanos a kevin.moreno01@epn.edu.ec.
        
        Al utilizar esta aplicación, aceptas estos términos y condiciones de uso. Gracias por ser parte de [Recetas].
        
        Fecha de la última actualización: [01/02/2024]
    
    `;

    const [loading, setLoading] = React.useState(false);

    const handleCreateAccount = () => {
        setLoading(true); // Activar el estado de carga
        // Validaciones
        if (nombre === '' || !/^[a-zA-Z]+$/.test(nombre)) {
            setNombreError('El nombre no es válido');
            setLoading(false);
            return;
        } else {
            setNombreError('');
        }

        if (email === '' || !email.includes('@')) {
            setEmailError('El correo electrónico no es válido');
            setLoading(false);
            return;
        } else {
            setEmailError('');
        }

        if (password.length < 6 || !/[A-Z]/.test(password)) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres y una mayúscula');
            setLoading(false);
            return;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('La contraseña y la confirmación no coinciden');
            setLoading(false);
            return;
        } else {
            setConfirmPasswordError('');
        }

        if (accType === '') {
            setAccTypeError('Selecciona un tipo de usuario');
            setLoading(false);
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
                setLoading(false);
            })
            .finally(() => {
                setLoading(false); // Desactivar el estado de carga incluso en caso de error
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
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

                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
                                <Ionicons
                                    name={acceptTerms ? 'checkbox-outline' : 'square-outline'}
                                    size={24}
                                    color="#E5690E"
                                />
                            </TouchableOpacity>
                            <Text style={styles.checkboxText}>
                                Acepto los
                                <Text style={{ fontWeight: 'bold' }} onPress={() => setShowTermsModal(true)}>
                                    {' Términos y condiciones'}
                                </Text>
                            </Text>
                        </View>

                        <Modal
                            visible={showTermsModal}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowTermsModal(false)}
                        >
                            <View style={styles.modalContainer}>
                                <ScrollView style={styles.modalContent}>
                                    {/* Contenido de tus términos y condiciones */}
                                    <Text>{termsAndConditionsText}</Text>
                                </ScrollView>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowTermsModal(false)}
                                >
                                    <Text style={{ color: 'white' }}>Pulsa atras para cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>

                        <View style={{ marginBottom: 30, flexDirection: 'row', marginTop: 20 }}>
                            <View style={{ marginBottom: 30, flexDirection: 'row', marginTop: 20 }}>
                                <TouchableOpacity
                                    style={acceptTerms ? styles.button : styles.disabledButton}
                                    onPress={handleCreateAccount}
                                    disabled={!acceptTerms}
                                >
                                    <Text style={styles.buttonText}>CREAR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                    </View>
                </View>
            </KeyboardAvoidingView>
            <Loading visible={loading} text="Creando Cuenta..." />
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
    button: {
        backgroundColor: '#E5690E',
        alignItems: 'center',
        padding: 15,
        borderRadius: 30, // Ajusta el radio del borde para que sea más redondo
        justifyContent: 'center',
        width: 200, // Ajusta el ancho del botón según tus necesidades
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#333',
    },
    disabledButton: {
        backgroundColor: '#E5690E',
        alignItems: 'center',
        padding: 15,
        borderRadius: 50,
        justifyContent: 'center',
        opacity: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        maxHeight: 300,
    },
    closeButton: {
        backgroundColor: '#E5690E',
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
      },

});