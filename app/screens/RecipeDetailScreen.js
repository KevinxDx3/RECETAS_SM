// RecipeDetailsScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, FlatList } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';

const RecipeDetailsScreen = ({ route }) => {
  const { recipe } = route.params;
  const { state, toggleLike } = useAuth();

  // Asegúrate de que state.user no sea undefined antes de acceder a su propiedad uid
  const userId = state.user ? state.user.uid : null;

  // Verifica si el usuario ha dado like en esta receta
  const likedByUser = state.likes[recipe.id]?.[userId];

  const handleLike = async () => {
    try {
      if (userId) {
        // Llama a la función toggleLike del contexto
        toggleLike(recipe.id, userId);
  
        // Actualiza la base de datos con el nuevo conteo de likes
        const recipeRef = doc(db, 'recipes', recipe.id);
  
        // Obtiene la receta actual para obtener el valor actual de 'like'
        const currentRecipe = await getDoc(recipeRef);
        const currentLikeValue = currentRecipe.data().like;
  
        // Calcula el nuevo valor de 'like' en función del estado actual de likedByUser
        const newLikeValue = likedByUser ? currentLikeValue - 1 : currentLikeValue + 1;
  
        // Actualiza los campos 'like' y 'likedByUser' en la base de datos
        await updateDoc(recipeRef, {
          like: newLikeValue,
          likedByUser: !likedByUser,
        });
      } else {
        console.error('Error: ID de usuario no disponible.');
      }
    } catch (error) {
      console.error('Error al manejar el like:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
      <Text style={styles.recipeDescription}>{recipe.description}</Text>
      <Text style={styles.recipeSubtitle}>Ingredientes:</Text>
      <FlatList
        data={recipe.ingredients}
        keyExtractor={(ingredient, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${item}`}</Text>
        )}
      />
      <Text style={styles.recipeSubtitle}>Pasos:</Text>
      <FlatList
        data={recipe.steps}
        keyExtractor={(step, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${item}`}</Text>
        )}
      />
      <Text style={styles.recipeSubtitle}>Tiempo: {recipe.time} min</Text>
      <Text style={styles.recipeSubtitle}>¿Es vegetariana?: {recipe.isVegetarian ? 'Sí' : 'No'}</Text>
      <Button
        title={`Like: ${likedByUser ? 'Quitar Like' : 'Dar Like'}`}
        onPress={handleLike}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  recipeDescription: {
    fontSize: 18,
    marginBottom: 10,
  },
  recipeSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipeStep: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default RecipeDetailsScreen;
