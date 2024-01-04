import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text, Alert, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import Loading from '../components/Loading';
import { Ionicons } from '@expo/vector-icons'; // Importar el ícono de Ionicons

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
            maxLength={50}
          />
          <Ionicons
            name="trash-outline"
            size={24}
            color="red"
            onPress={() => handleRemoveIngredient(index)}
          />
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="green"
            onPress={() => handleAddIngredient()}
          />
        </View>
      ))}

    </>
  );
};

const ChefRecipeForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState(['']);
  const [ingredients, setIngredients] = useState(['']);
  const [recipeType, setRecipeType] = useState('PlatoFuerte');
  const [like, setLike] = useState(0);
  const [loading, setLoading] = React.useState(false);

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

      if (!resultado.cancelled) {
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
      setLoading(true);

      if (!title || title.length > 50 || !description || description.length > 250 ||
        steps.some(step => !step || step.length > 150) || ingredients.some(ingredient => !ingredient || ingredient.length > 50)) {
        setLoading(false);
        return Alert.alert('Error', 'Por favor, completa todos los campos antes de guardar tu receta.');
      }

      if (!imagen) {
        setLoading(false);
        return Alert.alert('Seleccione una imagen para la receta');
      }

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
        recipeType,
        like,
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
    } finally {
      setLoading(false);
    }
  };

  if (state.userType !== '1') {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.recipeCard}>
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
          style={[styles.input, styles.multilineInput]}
          multiline={true}
          maxLength={250}
        />
        <IngredientList
          ingredients={ingredients}
          handleUpdateIngredient={handleUpdateIngredient}
          handleRemoveIngredient={handleRemoveIngredient}
          handleAddIngredient={handleAddIngredient}
        />
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <TextInput
              placeholder={`Paso ${index + 1} (máx. 150 caracteres)`}
              value={step}
              onChangeText={(value) => handleUpdateStep(index, value)}
              style={[styles.input, styles.multilineInput]}
              multiline={true}
              maxLength={150}
            />
            <Ionicons
              name="trash-outline"
              size={24}
              color="red"
              onPress={() => handleRemoveStep(index)}
            />
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="green"
              onPress={handleAddStep}
            />
          </View>
        ))}

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
        <View style={{
          borderTopWidth: 2,
          borderColor: '#E5690E',
          marginBottom: 10
        }}>
          <Picker
            selectedValue={time}
            onValueChange={(value) => setTime(value)}
            style={styles.input}
          >
            <Picker.Item label="-15 min" value="-15" />
            <Picker.Item label="15 min" value="15" />
            <Picker.Item label="+15 min" value="+15" />
          </Picker>
        </View>
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
          <Image source={{ uri: imagen }} style={styles.imagePreview} />
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Seleccionar Imagen</Text>
          <Ionicons
            name="image-outline"
            size={30}
            color="blue"
            onPress={pickImage}
          />
          <View style={{ alignItems: 'center' }}>

            <Ionicons
              name="add-circle-outline"
              size={50}
              color="blue"
              onPress={handleAddRecipe}
            />
            <Text>Subir Receta</Text>
          </View>
        </View>
        {loading && <Loading visible={loading} text="Agregando Receta..." />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  recipeCard: {
    backgroundColor: '#F0C396',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {

    borderTopWidth: 2,
    borderColor: '#E5690E',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    flex: 1,
  },
  multilineInput: {
    height: Platform.OS === 'ios' ? 80 : undefined,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default ChefRecipeForm;
