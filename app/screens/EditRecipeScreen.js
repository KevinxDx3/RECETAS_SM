import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Loading from '../components/Loading';
import { db } from '../../utils/firebase-config';

const IngredientList = ({ ingredients, handleUpdateIngredient, handleRemoveIngredient, handleAddIngredient }) => {
    return (
        <>
            {ingredients && ingredients.map((ingredient, index) => (
                <View key={index} style={styles.stepContainer}>
                    <TextInput
                        placeholder={`Ingrediente ${index + 1}`}
                        value={ingredient}
                        onChangeText={(value) => handleUpdateIngredient(index, value)}
                        style={styles.input}
                        maxLength={50} // Límite de 50 caracteres
                    />
                    <Button title="Eliminar" onPress={() => handleRemoveIngredient(index)} />
                </View>
            ))}
            <Button title="Agregar Ingrediente" onPress={() => handleAddIngredient()} />
        </>
    );
};

const EditRecipeScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState(['']);
    const [ingredients, setIngredients] = useState(['']);
    const [time, setTime] = useState('');
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [imagen, setImage] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [recipeType, setRecipeType] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carga
    const navigation = useNavigation();
    const route = useRoute();
    const recipeId = route.params.recipeId;

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
                const recipeData = recipeDoc.data();

                setTitle(recipeData.title);
                setDescription(recipeData.description);
                setSteps(recipeData.steps);
                setIngredients(recipeData.ingredients);
                setTime(recipeData.time);
                setIsVegetarian(recipeData.isVegetarian);
                setExistingImageUrl(recipeData.imageUrl);
                setRecipeType(recipeData.recipeType || ''); // Inicializar el estado con el valor actual
            } catch (error) {
                console.error('Error al cargar la receta:', error);
            }
        };

        fetchRecipe();
    }, [recipeId]);

    const pickImage = async () => {
        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaType: 'photo',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!resultado.canceled) {
                setImage(resultado.uri);
                setExistingImageUrl(resultado.uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
        }
    };

    const handleAddStep = () => {
        if (steps.length < 20) {
            setSteps([...steps, '']);
        }
    };

    const handleRemoveStep = (index) => {
        const updatedSteps = [...steps];
        updatedSteps.splice(index, 1);
        setSteps(updatedSteps);
    };

    const handleUpdateStep = (index, value) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = value;
        setSteps(updatedSteps);
    };

    const handleAddIngredient = () => {
        if (ingredients.length < 20) {
            setIngredients([...ingredients, '']);
        }
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients.splice(index, 1);
        setIngredients(updatedIngredients);
    };

    const handleUpdateIngredient = (index, value) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = value;
        setIngredients(updatedIngredients);
    };

    const getRandomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleUpdateRecipe = async () => {
        try {
            setLoading(true); // Activar el estado de carga

            if (!title || title.length > 50 || !description || description.length > 250 ||
                steps.some(step => !step || step.length > 150) || ingredients.some(ingredient => !ingredient || ingredient.length > 50)) {
                setLoading(false); // Desactivar el estado de carga
                return Alert.alert('Error', 'Por favor, completa todos los campos antes de guardar la receta.');
            }

            let newImageUrl = existingImageUrl; // Por defecto, mantener la imagen existente

            if (imagen) {
                const randomCode = getRandomCode();
                const imageName = `${randomCode}.png`;

                const storage = getStorage();
                const imageRef = ref(storage, `images/${imageName}`);
                const blob = await (await fetch(imagen)).blob();

                const uploadTask = uploadBytesResumable(imageRef, blob, {
                    contentType: 'image/png',
                });

                await uploadTask;

                // Obtener la URL de la nueva imagen
                newImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            // Antes de actualizar el documento, eliminar la imagen existente si es necesario
            if (existingImageUrl && imagen && existingImageUrl !== imagen) {
                const existingImageRef = ref(storage, `images/${existingImageUrl}`);
                await deleteObject(existingImageRef);
            }

            const recipeRef = doc(db, 'recipes', recipeId);
            const updatedRecipeData = {
                title,
                description,
                steps,
                ingredients,
                time,
                isVegetarian,
                imageUrl: newImageUrl, // Usar la nueva URL o la existente
                recipeType,
            };

            await updateDoc(recipeRef, updatedRecipeData);

            navigation.navigate('Home');
        } catch (error) {
            console.error('Error al actualizar la receta:', error);
            // Puedes agregar un manejo específico del error aquí si es necesario
        } finally {
            setLoading(false); // Desactivar el estado de carga incluso en caso de error
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.cardContainer}>
                <TextInput
                    placeholder="Título (máx. 50 caracteres)"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    maxLength={50}
                />
                <TextInput
                    placeholder="Descripción (máx. 250 caracteres)"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                    multiline={true}
                    maxLength={250}
                />

                {steps.map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                        <TextInput
                            placeholder={`Paso ${index + 1} (máx. 150 caracteres)`}
                            value={step}
                            onChangeText={(value) => handleUpdateStep(index, value)}
                            style={styles.input}
                            multiline={true}
                            maxLength={150}
                        />
                        <Button title="Eliminar" onPress={() => handleRemoveStep(index)} />
                    </View>
                ))}
                <Button title="Agregar Paso" onPress={handleAddStep} />

                <IngredientList
                    ingredients={ingredients}
                    handleUpdateIngredient={handleUpdateIngredient}
                    handleRemoveIngredient={handleRemoveIngredient}
                    handleAddIngredient={handleAddIngredient}
                />

                <Picker
                    selectedValue={time}
                    onValueChange={(value) => setTime(value)}
                    style={styles.input}
                >
                    <Picker.Item label="-15 min" value="-15" />
                    <Picker.Item label="15 min" value="15" />
                    <Picker.Item label="+15 min" value="+15" />
                </Picker>

                <View style={styles.input}>
                    <Text>¿Es vegetariana?</Text>
                    <Picker
                        selectedValue={isVegetarian}
                        onValueChange={(value) => setIsVegetarian(value)}
                    >
                        <Picker.Item label="No" value={false} />
                        <Picker.Item label="Sí" value={true} />
                    </Picker>
                </View>

                <View style={styles.input}>
                    <Text>Tipo de receta:</Text>
                    <Picker
                        selectedValue={recipeType}
                        onValueChange={(value) => setRecipeType(value)}
                    >
                        <Picker.Item label="Postre" value="Postre" />
                        <Picker.Item label="Entrada" value="Entrada" />
                        <Picker.Item label="Plato Fuerte" value="PlatoFuerte" />
                    </Picker>
                </View>

                {existingImageUrl && (
                    <Image source={{ uri: existingImageUrl }} style={{ width: 200, height: 200 }} />
                )}

                {imagen && !existingImageUrl && (
                    <Image source={{ uri: imagen }} style={{ width: 200, height: 200 }} />
                )}

                <Button title="Seleccionar imagen" onPress={pickImage} />
                <Button title="Actualizar Receta" onPress={handleUpdateRecipe} />
                {loading && <Loading visible={loading} text="Actualizando Receta..." />}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        elevation: 3, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5EBD6',
        borderRadius: 5,
        // Flex: 1 aquí puede hacer que los elementos dentro del input no se vean bien, ajusta según sea necesario
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default EditRecipeScreen;
