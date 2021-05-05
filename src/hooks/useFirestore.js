import { useState, useEffect } from 'react';
import { projectFirestore, projectStorage } from '../firebase/config';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const useFirestore = (collection) => {
    
    const [doc, setDoc] = useState(null);

    useEffect(() => {

        const unsub = projectFirestore.collection(collection)
        .onSnapshot(snapshot => {
            var id = cookies.get('imageId');
            snapshot.forEach(docRef => {
                if(docRef.id === id) {
                    setDoc({ ...docRef.data(), id: docRef.id });
                }
                // Delete expired images
                if(docRef.data().createdAt != null) {
                    if(docRef.data().createdAt.seconds + 12*3600 < Date.now() / 1000) {
                        projectFirestore.collection(collection).where('__name__', '==', docRef.id).get().then(function(querySnapshot) {
                            querySnapshot.forEach(function(doc) {
                                doc.ref.delete();
                            });
                        });
                        projectStorage.refFromURL(docRef.data().url).delete();
                    }
                }
            });
        });
        return () => unsub();
    }, [collection]);

    return { doc };
}

export default useFirestore;