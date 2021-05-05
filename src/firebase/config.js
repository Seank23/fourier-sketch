import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

// Your web app's Firebase configuration
var firebaseConfig = {
apiKey: "AIzaSyACqE6-wvmQ4DeQtiS6kTl0FnUPMmDTUSs",
authDomain: "fouriersketch.firebaseapp.com",
projectId: "fouriersketch",
storageBucket: "fouriersketch.appspot.com",
messagingSenderId: "656521444385",
appId: "1:656521444385:web:bb70e29b3cc0d886dd3760"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { projectStorage, projectFirestore, timestamp };