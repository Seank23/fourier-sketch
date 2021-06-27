import { useState, useEffect, useRef } from 'react';
import { projectFirestore, projectStorage } from '../firebase/config';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const useFirestore = (collection) => {
    
    const [doc, setDoc] = useState(null);
    const isDeleting = useRef(false);

    useEffect(() => {

        const unsub = projectFirestore.collection(collection)
        .onSnapshot(snapshot => {
            var id = cookies.get('imageId');
            snapshot.forEach(docRef => {
                if(docRef.id === id) {
                    setDoc({ ...docRef.data(), id: docRef.id });
                }
                // Delete expired images
                if(!isDeleting.current && docRef.data().createdAt != null) {
                    if(docRef.data().createdAt.seconds + 2*3600 < Date.now() / 1000) {
                        isDeleting.current = true;
                        projectFirestore.collection(collection).where('__name__', '==', docRef.id).get().then(function(querySnapshot) {
                            querySnapshot.forEach(function(doc) {
                                doc.ref.delete();
                            });
                        });
                        projectStorage.refFromURL(docRef.data().url).delete();
                        setTimeout(() => isDeleting.current = false, 100);
                    }
                }
            });
        });
        return () => unsub();
    }, [collection]);

    return { doc };
}

export default useFirestore;