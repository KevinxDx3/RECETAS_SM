import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

//Navegacion Stacks
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


//Screens
import { LoginScreen } from './app/screens/loginScreen'
import { RegisterScreen } from './app/screens/registerScreen'
import { HomeScreen } from './app/screens/homeScreen'
import ChefRecipeForm from './app/screens/ChefRecipeForm';
import UserRecipeList from './app/screens/UserRecipeList';
import ChefRecipeListScreen from './app/screens/ChefRecipeListScreen';
import EditRecipeScreen from './app/screens/EditRecipeScreen';

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
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChefRecipeScreen" component={ChefRecipeForm} options={{ headerShown: false }} />
          <Stack.Screen name="UserRecipeListScreen" component={UserRecipeList} options={{ headerShown: false }} />
          <Stack.Screen name="ChefRecipeScreenList" component={ChefRecipeListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditRecipeScreen" component={EditRecipeScreen} options={{ headerShown: false }} />
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