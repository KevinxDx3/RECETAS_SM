import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const initialState = {
  user: null,
  userType: null,
  auth: null, // Agregado para almacenar el objeto auth
  likes: {},
};


const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      console.log('Login action called. User:', action.payload.user, 'UserType:', action.payload.userType, 'Auth:', action.payload.auth);
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        auth: action.payload.auth,
      };
    case 'LOGOUT':
      return initialState;
    case 'TOGGLE_LIKE':
      return {
        ...state,
        likes: {
          ...state.likes,
          [action.payload.recipeId]: {
            ...state.likes[action.payload.recipeId],
            [action.payload.userId]: !state.likes[action.payload.recipeId]?.[action.payload.userId],
          },
        },
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user, userType, auth) => {
    dispatch({ type: 'LOGIN', payload: { user, userType, auth } });
  };
  

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleLike = (recipeId, userId) => {
    dispatch({ type: 'TOGGLE_LIKE', payload: { recipeId, userId } });
    // Aquí puedes agregar la lógica para actualizar los likes en tu base de datos (Firebase u otro servicio)
  };

  // Efecto para guardar el estado en AsyncStorage cuando cambia
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('authState', JSON.stringify(state));
      } catch (error) {
        console.error('Error al guardar el estado en AsyncStorage:', error);
      }
    };

    saveState();
  }, [state]);

  return (
    <AuthContext.Provider value={{ state, login, logout, toggleLike,dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
