import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

//Navegacion Stacks
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


//Screens
import { loginScreen } from './app/screens/loginScreen'
import { registerScreen } from './app/screens/registerScreen'
import { homeScreen } from './app/screens/homeScreen'
import ChefRecipeForm from './app/screens/ChefRecipeForm';
import UserRecipeList from './app/screens/UserRecipeList';
import ChefRecipeListScreen from './app/screens/ChefRecipeListScreen';
import EditRecipeScreen from './app/screens/EditRecipeScreen';
import RecipeDetailsScreen from './app/screens/RecipeDetailScreen';

//firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './utils/firebase-config';

//context
import { AuthProvider } from './app/screens/AuthContext';

//Stack

const Stack = createStackNavigator();

export default function App() {

  return (

    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={loginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={registerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={homeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChefRecipeScreen" component={ChefRecipeForm} options={{ headerShown: false }} />
          <Stack.Screen name="UserRecipeListScreen" component={UserRecipeList} options={{ headerShown: false }} />
          <Stack.Screen name="ChefRecipeScreenList" component={ChefRecipeListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditRecipeScreen" component={EditRecipeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RecipeDetailScreen" component={RecipeDetailsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

  },
});
