import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

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
      <View style={styles.leftContainer}>
        <Text style={styles.welcomeText}>Mi libro de recetas</Text>
        {state.userType === '1' && (
          <>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => navigation.navigate('ChefRecipeScreen')}
            >
              <Icon name="plus-circle" size={20} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Crear Receta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => navigation.navigate('ChefRecipeScreenList')}
            >
              <Icon name="edit" size={20} color="#fff" style={styles.icon} />
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
      </View>

      <View style={styles.rightContainer}>
        {/* Carril de tarjetas para recetas populares */}
        <Text style={styles.header}>Recetas Populares</Text>
        <FlatList
          data={popularRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={state.userType === '1' ? styles.disabledRecipeCard : styles.popularRecipeCard}
              onPress={() => {
                if (state.userType === '2') {
                  navigation.navigate('RecipeDetailScreen', { recipe: item });
                }
              }}
              pointerEvents={state.userType === '1' ? 'none' : 'auto'}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.popularRecipeImage} />
              <Text style={styles.popularRecipeTitle}>{item.title}</Text>
              <Text style={styles.Description}>{item.recipeType}</Text>
              <Text style={styles.Description}>{item.time} min </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#FA953B',
    borderBottomEndRadius: 10000,
    borderBottomStartRadius: 10000,
    height: '100%',
    elevation: 10,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'stretch',
    padding: 15,
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: 'Bradley Hand',
    marginBottom: 20,
    color: 'white',
  },
  buttonContainer: {
    backgroundColor: '#E5690E',
    padding: '6%',
    borderRadius: 50,
    marginTop: '3%',
    flexDirection: 'row',
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  popularRecipeCard: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5EBD6',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    height: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  disabledRecipeCard: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5EBD6',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    height: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
    
  },
  popularRecipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  Description: {
    fontSize: 10,
    marginTop: 5,
  },
  popularRecipeImage: {
    width: '100%',
    height: '50%',
    borderRadius: 8,
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
});
