import { firebase } from '../../base'


export const getEventById = async (id) => {
    try {
        const doc = await firebase.firestore()
            .collection('evento')
            .doc(id)
            .get()

        await firebase
            .firestore()
            .collection('evento')
            .doc(id)
            .update({
                views: firebase.firestore.FieldValue.increment(1),
            });
        if (!doc.exists) {
            return null
        }
        return {
            ...doc.data(),
            id: doc.id
        }
    }
    catch (error) {
        return null
    }
}

export const getSponsorsByCategoriesIds = async (categoriesIds) => {
    try {
        const snapshot = await firebase
            .firestore()
            .collection('sponsor')
            .where('categories', 'array-contains-any', categoriesIds)
            .get()
        let sponsors = snapshot.docs.map(doc => {
            return {
                ...doc.data(),
                id: doc.id
            };
        });
        sponsors = shuffleArray(sponsors);
        return sponsors;
    } catch (error) {
        return []
    }
}


export const getEventCategories = async () => {
    if (sessionStorage.getItem('eventCategories')) {
        return JSON.parse(sessionStorage.getItem('eventCategories'))
    } else {
        const categories = await fetchEventCategories()
        sessionStorage.setItem('eventCategories', JSON.stringify(categories))
        return categories
    }
}

export const getOrganizers = async () => {
    if (sessionStorage.getItem('organizers')) {
        return JSON.parse(sessionStorage.getItem('organizers'))
    } else {
        const categories = await fetchBestOrganizers()
        sessionStorage.setItem('organizers', JSON.stringify(categories))
        return categories
    }
}

export const getTopEvents = async () => {
    if (sessionStorage.getItem('topEvents')) {
        return JSON.parse(sessionStorage.getItem('topEvents'))
    } else {
        let events = await fetchEvents()
        events = events.filter(event => event.destaque === true)
        sessionStorage.setItem('topEvents', JSON.stringify(events))
        return events
    }
}

export const getPopularEvents = async () => {
    if (sessionStorage.getItem('popularEvents')) {
        return JSON.parse(sessionStorage.getItem('popularEvents'))
    } else {
        let events = await fetchEvents()
        events = events.sort((a, b) => b.views - a.views)
        sessionStorage.setItem('popularEvents', JSON.stringify(events))
        return events
    }
}

export const getAllEvents = async () => {
    if (sessionStorage.getItem('allEvents')) {
        return JSON.parse(sessionStorage.getItem('allEvents'))
    } else {
        let events = await fetchEvents()
        events = shuffleArray(events)
        sessionStorage.setItem('allEvents', JSON.stringify(events))
        return events
    }
}

export const fetchBestOrganizers = async () => {
    try {
        const snapshot = await firebase.firestore()
            .collection('organizador')
            .get()
        let org = snapshot.docs.map(doc => {
            return {
                ...doc.data(),
                id: doc.id
            };
        });
        org = shuffleArray(org);
        return org.slice(0, 10);
    } catch (error) {
        return []
    }
}

export const fetchEvents = async () => {
    if (sessionStorage.getItem('events')) {
        return JSON.parse(sessionStorage.getItem('events'))
    }
    try {
        const today = firebase.firestore.Timestamp.fromDate(new Date());
        const snapshot = await firebase.firestore()
            .collection('evento')
            .where('data', '>=', today)
            .get()
        let events = snapshot.docs.map(doc => {
            return {
                ...doc.data(),
                id: doc.id
            };
        });
        // Remove events that are deleted
        events = events.filter((item) => !item.deleted);
        events = shuffleArray(events);
        sessionStorage.setItem('events', JSON.stringify(events))
        return events;
    } catch (error) {
        return []
    }
}

export const fetchEventCategories = async () => {
    try {
        const snapshot = await firebase.firestore()
            .collection('categoria')
            .get()
        let categories = snapshot.docs.map(doc => {
            return {
                ...doc.data(),
                id: doc.id
            };
        });
        categories= categories.sort((a, b) => a.name.localeCompare(b.name));
        return categories;
    } catch (error) {
        return []
    }
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}