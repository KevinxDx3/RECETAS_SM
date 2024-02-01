import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TextInput, Button, ScrollView, Switch } from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase-config';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';


const UserRecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderText, setOrderText] = useState('');
  const [showVegetarian, setShowVegetarian] = useState(false);
  const { state } = useAuth();
  const navigation = useNavigation();

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
          const capitalizedOrderType = orderType.charAt(0).toUpperCase() + orderType.slice(1);
          recipesQuery = query(collection(db, 'recipes'), where('recipeType', '==', capitalizedOrderType));
          setOrderText(`Mostrar solo ${capitalizedOrderType}`);
        }

        if (timeFilter) {
          recipesQuery = query(collection(db, 'recipes'), where('time', '==', timeFilter));
          setOrderText(`Mostrar solo recetas de ${timeFilter} min`);
        }

        // Aplicar filtro de recetas vegetarianas si está activado
        if (showVegetarian) {
          recipesQuery = query(collection(db, 'recipes'), where('isVegetarian', '==', true));
          // No es necesario establecer el texto aquí, ya que no se mostrará
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

      <Button
        title="Ver Detalles"
        onPress={() => navigation.navigate('RecipeDetailScreen', { recipe: item })}
        color="#E5690E"
      />

    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={{
        backgroundColor: '#FA953B',
        borderBottomEndRadius: 50,
        borderBottomStartRadius: 50,
        height: 275,
        padding: 20,

      }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recetas por nombre"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Button title="Limpiar" onPress={() => setSearchQuery('')} color="#E5690E"/>
        </View>
        <View style={styles.orderFilterContainer}>
          <View style={{ paddingTop: 50, flexDirection: 'column', flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
              <Text style={styles.switchText}>Recetas Vegetarianas: </Text>
              <Switch
                value={showVegetarian}
                onValueChange={() => setShowVegetarian(!showVegetarian)}
                style={styles.switch}
              />
            </View>


            <Picker
              selectedValue={orderType}
              onValueChange={(value) => {
                setOrderType(value);
                setOrderText(value === 'recipeType' ? 'Ordenado por Tipo' : value === 'vegetarian' ? 'Filtrar Vegetarianas' : value === 'time' ? 'Ordenado por Tiempo' : '');
              }}
              style={styles.picker}
            >

              <Picker.Item label="Tipo de receta" value="" />
              <Picker.Item label="Postre" value="postre" />
              <Picker.Item label="Entrada" value="entrada" />
              <Picker.Item label="Plato Fuerte" value="platoFuerte" />
            </Picker>

            <View style={{
              borderBottomWidth: 1,
              borderBottomColor: 'white'
            }} />

            <Text style={styles.orderText}>{orderText}</Text>

            <Picker
              selectedValue={timeFilter}
              onValueChange={(value) => {
                setTimeFilter(value);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Tiempo" value="" />
              <Picker.Item label="-15 min" value="-15" />
              <Picker.Item label="15 min" value="15" />
              <Picker.Item label="+15 min" value="+15" />
            </Picker>

          </View>
        </View>
      </View>
      <View
        style={{
          padding: 20
        }}>
        <Text style={styles.header}>Recetas Disponibles:</Text>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipeItem}
        />
      </View >
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {

    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
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
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  orderFilterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  switch: {
    marginRight: 10,
  },
  switchText: {
    fontSize: 16,
    color: 'white',
  },
  picker: {
    flex: 1,
    marginRight: 10,
    color: 'white',
    borderColor: 'black',
    borderBottomWidth: 1,
    borderBottomColor: 'darkslategray'


  },
  orderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  pickerItem: {
    color: 'white',  // Color del texto de los elementos del Picker
  },
});

export default UserRecipeList;
