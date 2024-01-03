import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useFocusEffect } from '@react-navigation/native';


export const HomeScreen = () => {
  const { state } = useAuth();
  const navigation = useNavigation();
  const [popularRecipes, setPopularRecipes] = useState([]);

  const fetchPopularRecipes = async () => {
    try {
      const recipesQuery = query(collection(db, 'recipes'), orderBy('like', 'desc'), limit(3));
      const recipesSnapshot = await getDocs(recipesQuery);
      const popularRecipeData = recipesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPopularRecipes(popularRecipeData);
    } catch (error) {
      console.error('Error al obtener las recetas populares:', error);
    }
  };

  // Utiliza useFocusEffect para recargar las recetas populares cada vez que se visite la ventana de Home
  useFocusEffect(
    React.useCallback(() => {
      fetchPopularRecipes();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenido, {state.user && state.user.displayName}</Text>

      {state.userType === '1' && (
        <>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => navigation.navigate('ChefRecipeScreen')}
          >
            <Text style={styles.buttonText}>Crear Receta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => navigation.navigate('ChefRecipeScreenList')}
          >
            <Text style={styles.buttonText}>Ver y Eliminar Recetas</Text>
          </TouchableOpacity>
        </>
      )}

      {state.userType === '2' && (
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate('UserRecipeListScreen')}
        >
          <Text style={styles.buttonText}>Ver Recetas</Text>
        </TouchableOpacity>
      )}

      {/* Carril de tarjetas para recetas populares */}
      <Text style={styles.header}>Recetas Populares:</Text>
      <FlatList
        data={popularRecipes}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.popularRecipeCard}
            onPress={() => navigation.navigate('RecipeDetailScreen', { recipe: item })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.popularRecipeImage} />
            <Text style={styles.popularRecipeTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    flex: 0,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  popularRecipeCard: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#F5EBD6',
    borderRadius: 10,
    padding: 10,
    width: 120,
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  popularRecipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  popularRecipeImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
});

