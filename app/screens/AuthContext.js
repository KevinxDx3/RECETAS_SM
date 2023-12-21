// AuthContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  userType: null,
  likes: {}, // Nuevo campo para almacenar la información de likes
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
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

  const login = (user, userType) => {
    dispatch({ type: 'LOGIN', payload: { user, userType } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleLike = (recipeId, userId) => {
    dispatch({ type: 'TOGGLE_LIKE', payload: { recipeId, userId } });
    // Aquí puedes agregar la lógica para actualizar los likes en tu base de datos (Firebase u otro servicio)
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, toggleLike }}>
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
