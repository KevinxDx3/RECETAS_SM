import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

export const homeScreen = () => {
  const { state } = useAuth();
  const navigation = useNavigation();

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
            onPress={() => navigation.navigate('ChefRecipeScreenList')} // Cambia el nombre de la pantalla según tus necesidades
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
});
