
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {

    apiKey: "AIzaSyDCibRd4TVB769CRuBrx0FkakNgTnWW5nk",
    authDomain: "recetas-bf4e1.firebaseapp.com",
    projectId: "recetas-bf4e1",
    storageBucket: "recetas-bf4e1.appspot.com",
    messagingSenderId: "882825864007",
    appId: "1:882825864007:web:6ef8964d1e4d753542e262",
    measurementId: "G-FY0JGS8FBY"

  };


  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  export {db};


