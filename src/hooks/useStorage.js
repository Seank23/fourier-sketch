import { useState, useEffect } from 'react';
import { projectStorage, projectFirestore, timestamp } from '../firebase/config';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const useStorage = (file) => {
    
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);

    useEffect(() => {
        // references
        const storageRef = projectStorage.ref(file.name);
        const collectionRef = projectFirestore.collection('images');

        storageRef.put(file).on('state_changed', (snapshot) => {
            let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(percentage);
        },
        (err) => {
            setError(err);
        },
        async () => {
            const url = await storageRef.getDownloadURL();
            const createdAt = timestamp();
            collectionRef.add({ url, createdAt }).then(function(docRef) {
                cookies.set('imageId', docRef.id, { path: '/', maxAge: 1800 });
            });
            setUrl(url);
        })
    }, [file]);

    return { progress, url, error }
}

export default useStorage;