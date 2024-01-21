import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { collection, getDocs, deleteDoc, query, where, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { ref, deleteObject, getStorage } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

const ChefRecipeListScreen = () => {
  const { state } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Cargar las recetas del chef desde Firebase Firestore
    const fetchRecipes = async () => {
      try {
        const recipesQuery = query(
          collection(db, 'recipes'),
          where('chefId', '==', state.user.uid)
        );
        const querySnapshot = await getDocs(recipesQuery);

        const recipesData = [];
        querySnapshot.forEach((doc) => {
          recipesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setRecipes(recipesData);
      } catch (error) {
        console.error('Error al cargar recetas:', error);
      }
    };

    fetchRecipes();
  }, [state.user.uid]);

  const handleDeleteRecipe = (recipeId, imageUrl) => {
    // Mostrar un mensaje de confirmación
    Alert.alert(
      'Eliminar receta',
      '¿Estás seguro de que deseas eliminar esta receta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              // Eliminar la receta de Firebase Firestore
              const recipeRef = doc(db, 'recipes', recipeId);
              await deleteDoc(recipeRef);

              // Eliminar la imagen del almacenamiento de Firebase
              const storageRef = ref(getStorage(), imageUrl);
              await deleteObject(storageRef);

              // Filtrar las recetas locales para reflejar el cambio
              setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
            } catch (error) {
              console.error('Error al eliminar la receta:', error);
              Alert.alert('Error', 'Hubo un error al intentar eliminar la receta.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditRecipe = (recipeId) => {
    // Navegar a la pantalla de edición con el ID de la receta seleccionada
    navigation.navigate('EditRecipeScreen', { recipeId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Recetas</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleEditRecipe(item.id)} style={styles.editButton}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                // Guardar la receta seleccionada antes de mostrar la alerta
                setSelectedRecipe(item);
                handleDeleteRecipe(item.id, item.imageUrl);
              }} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  recipeTitle: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChefRecipeListScreen;
