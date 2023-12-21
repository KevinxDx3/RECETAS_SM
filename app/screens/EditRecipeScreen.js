import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';

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
    const navigation = useNavigation();
    const { state } = useAuth();
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
            const newImageUrl = await getDownloadURL(uploadTask.snapshot.ref);

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
                imageUrl: imagen ? newImageUrl : existingImageUrl, // Usar la nueva URL o la existente
                recipeType,
            };

            await updateDoc(recipeRef, updatedRecipeData);

            navigation.navigate('Home');
        } catch (error) {
            console.error('Error al actualizar la receta:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
            />
            {steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                    <TextInput
                        placeholder={`Paso ${index + 1}`}
                        value={step}
                        onChangeText={(value) => handleUpdateStep(index, value)}
                        style={styles.input}
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
                <Text>Tipo de Receta</Text>
                <Picker
                    selectedValue={recipeType}
                    onValueChange={(value) => setRecipeType(value)}
                >
                    <Picker.Item label="Postre" value="postre" />
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Plato Fuerte" value="platoFuerte" />
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
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5EBD6',
        borderRadius: 5,
        flex: 1,
    },
});

export default EditRecipeScreen;
