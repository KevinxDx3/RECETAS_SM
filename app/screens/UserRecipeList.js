import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TextInput, Button } from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';

const UserRecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderText, setOrderText] = useState('');
  const [showVegetarian, setShowVegetarian] = useState(false); // Nuevo estado para el interruptor
  const { state } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let recipesQuery = query(collection(db, 'recipes'));

        if (searchQuery) {
          recipesQuery = query(collection(db, 'recipes'), where('title', '>=', searchQuery));
        }

        if (orderType === 'time') {
          recipesQuery = query(collection(db, 'recipes'), orderBy('time'));
          setOrderText('Ordenado por Tiempo');
        } else if (orderType === 'recipeType') {
          recipesQuery = query(collection(db, 'recipes'), orderBy('recipeType'));
          setOrderText('Ordenado por Tipo');
        } else if (orderType === 'postre' || orderType === 'entrada' || orderType === 'platoFuerte') {
          recipesQuery = query(collection(db, 'recipes'), where('recipeType', '==', orderType));
          setOrderText(`Mostrar solo ${orderType}`);
        }

        if (timeFilter) {
          recipesQuery = query(collection(db, 'recipes'), where('time', '==', timeFilter));
          setOrderText(`Mostrar solo recetas de ${timeFilter} min`);
        }

        // Aplicar filtro de recetas vegetarianas si está activado
        if (showVegetarian) {
          recipesQuery = query(collection(db, 'recipes'), where('isVegetarian', '==', true));
          setOrderText('Mostrar solo recetas vegetarianas');
        }

        const recipesSnapshot = await getDocs(recipesQuery);
        const recipeData = recipesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipeData);
      } catch (error) {
        console.error('Error al obtener las recetas:', error);
      }
    };

    fetchRecipes();
  }, [searchQuery, orderType, timeFilter, showVegetarian]);

  if (state.userType !== '2') {
    return null;
  }

  const renderStep = ({ item, index }) => (
    <Text key={index}>{`${index + 1}. ${item}`}</Text>
  );

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
      <Text style={styles.recipeDescription}>{item.description}</Text>
      <Text style={styles.recipeSubtitle}>Ingredientes:</Text>
      <FlatList
        data={item.ingredients}
        keyExtractor={(ingredient, index) => index.toString()}
        renderItem={({ item: ingredient, index }) => (
          <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${ingredient}`}</Text>
        )}
      />
      <Text style={styles.recipeSubtitle}>Pasos:</Text>
      <FlatList
        data={item.steps}
        keyExtractor={(step, index) => index.toString()}
        renderItem={({ item: step, index }) => (
          <Text key={index} style={styles.recipeStep}>{`${index + 1}. ${step}`}</Text>
        )}
      />
      <Text style={styles.recipeSubtitle}>Tiempo: {item.time} min</Text>
      <Text style={styles.recipeSubtitle}>¿Es vegetariana?: {item.isVegetarian ? 'Sí' : 'No'}</Text>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas por nombre"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Button title="Limpiar" onPress={() => setSearchQuery('')} />
      </View>
      <View style={styles.orderFilterContainer}>
        <Button
          title={`Recetas Vegetarianas: ${showVegetarian ? 'Activado' : 'Desactivado'}`}
          onPress={() => setShowVegetarian(!showVegetarian)}
        />
        <Picker
          selectedValue={orderType}
          onValueChange={(value) => {
            setOrderType(value);
            setOrderText(value === 'recipeType' ? 'Ordenado por Tipo' : value === 'vegetarian' ? 'Filtrar Vegetarianas' : value === 'time' ? 'Ordenado por Tiempo' : '');
          }}
        >
          <Picker.Item label="Tipo de receta" value="" />
          <Picker.Item label="Postre" value="postre" />
          <Picker.Item label="Entrada" value="entrada" />
          <Picker.Item label="Plato Fuerte" value="platoFuerte" />

        </Picker>
        <Text style={styles.orderText}>{orderText}</Text>

        <Picker
          selectedValue={timeFilter}
          onValueChange={(value) => {
            setTimeFilter(value);
          }}
        >
          <Picker.Item label="Tiempo" value="" />
          <Picker.Item label="-15 min" value="-15" />
          <Picker.Item label="15 min" value="15" />
          <Picker.Item label="+15 min" value="+15" />
        </Picker>
      </View>
      <Text style={styles.header}>Recetas Disponibles:</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeCard: {
    marginBottom: 20,
    backgroundColor: '#F5EBD6',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  recipeTitle: {
    fontSize: 18,
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
    fontSize: 16,
    marginBottom: 10,
  },
  recipeSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipeStep: {
    fontSize: 14,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  orderFilterContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  orderText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserRecipeList;
