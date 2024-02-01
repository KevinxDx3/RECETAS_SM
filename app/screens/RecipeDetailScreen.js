import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { IconButton } from 'react-native-paper';


const RecipeDetailScreen = ({ route }) => {
  const { recipe } = route.params;
  const { state, toggleLike } = useAuth();

  // Asegúrate de que state.user no sea undefined antes de acceder a su propiedad uid
  const userId = state.user ? state.user.uid : null;

  // Estado local para el botón de Like
  const [liked, setLiked] = useState(false);

  // Verifica si el usuario ha dado like en esta receta
  const likedByUser = state.likes[recipe.id]?.[userId];

  useEffect(() => {
    if (userId) {
      setLiked(state.likes[recipe.id]?.[userId] || false);
    }
  }, [state.likes, userId, recipe.id]);

  const handleLike = async () => {
    setLiked(!liked);
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
    <ScrollView style={styles.container}>
      <View style={[styles.recipeCard, { backgroundColor: recipe.isVegetarian ? '#C0E5C1' : '#FA953B' }]}>
        <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
        <View style={styles.detailsContainer}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black' }}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
          </View>
          <View style={styles.separator}></View>
          <Text style={styles.recipeSubtitle}>Descripción:</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black', marginTop: 5 }}>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
          </View>
          <View style={styles.separator}></View>
          <Text style={styles.recipeSubtitle}>Ingredientes:</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black', marginTop: 5 }}>
            <FlatList
              data={recipe.ingredients}
              keyExtractor={(ingredient, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${item}`}</Text>
              )}
            />
          </View>
          <View style={styles.separator}></View>
          <Text style={styles.recipeSubtitle}>Pasos:</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black', marginTop: 5 }}>
            <FlatList
              data={recipe.steps}
              keyExtractor={(step, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${item}`}</Text>
              )}
            />
          </View>
          <View style={styles.separator}></View>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black', marginTop: 5 }}>
            <Text style={styles.recipeSubtitle}>{recipe.time} min</Text>
          </View>
          <View style={styles.separator}></View>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 5, borderWidth: 2.5, borderColor: 'black', marginTop: 5 }}>
            <Text style={styles.recipeSubtitle}>¿Es vegetariana?: {recipe.isVegetarian ? 'Sí' : 'No'}</Text>
          </View>
          <View style={styles.separator}></View>
          <TouchableOpacity
            style={[styles.likeButton, { backgroundColor: liked ? '#F0AD00' : '#EFD2C4' }]}
            onPress={handleLike}
          >
            <IconButton
              icon={liked ? 'star' : 'star-outline'}
              color='white'
              iconColor={liked ? 'white' : 'black'}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  recipeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  detailsContainer: {
    padding: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  recipeSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recipeDescription: {
    fontSize: 18,
    color: '#555',
  },
  recipeStep: {
    fontSize: 16,
    color: '#555',
  },
  likeButton: {
    padding: 15,
    borderRadius: 50,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
  },
});

export default RecipeDetailScreen;
