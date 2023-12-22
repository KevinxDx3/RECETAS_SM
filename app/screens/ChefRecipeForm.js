import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

const IngredientList = ({ ingredients, handleUpdateIngredient, handleRemoveIngredient, handleAddIngredient }) => {
  return (
    <>
      {ingredients.map((ingredient, index) => (
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

const ChefRecipeForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState(['']);
  const [ingredients, setIngredients] = useState(['']);
  const [recipeType, setRecipeType] = useState('PlatoFuerte'); // Valor predeterminado
  const [like, setLike] = useState(0); // Valor predeterminado


  const [time, setTime] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [imagen, setImage] = useState(null);
  const navigation = useNavigation();
  const { state } = useAuth();

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

  const handleAddRecipe = async () => {
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

      const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

      const recipeData = {
        title,
        description,
        steps,
        ingredients,
        time,
        isVegetarian,
        imageUrl,
        chefId: state.user.uid,
        recipeType, // Agregar el tipo de receta
        like, // Agregar el campo like
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('Receta agregada con ID:', docRef.id);

      setTitle('');
      setDescription('');
      setSteps(['']);
      setIngredients(['']);
      setTime('');
      setIsVegetarian(false);
      setImage(null);

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error al agregar la receta:', error.message);
      console.log('Error details:', error.details);
    }
  };

  if (state.userType !== '1') {
    return null;
  }

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

      {/* Agregar componente para la lista de ingredientes */}
      <IngredientList
        ingredients={ingredients}
        handleUpdateIngredient={handleUpdateIngredient}
        handleRemoveIngredient={handleRemoveIngredient}
        handleAddIngredient={handleAddIngredient}
      />

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

      <Picker
        selectedValue={time}
        onValueChange={(value) => setTime(value)}
        style={styles.input}
      >
        <Picker.Item label="-15 min" value="-15" />
        <Picker.Item label="15 min" value="15" />
        <Picker.Item label="+15 min" value="+15" />
      </Picker>

      {/* Agregar opción para seleccionar si es vegetariana */}
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

      {imagen && (
        <Image source={{ uri: imagen }} style={{ width: 200, height: 200 }} />
      )}
      <Button title="Seleccionar imagen" onPress={pickImage} />
      <Button title="Agregar Receta" onPress={handleAddRecipe} />
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

export default ChefRecipeForm;
