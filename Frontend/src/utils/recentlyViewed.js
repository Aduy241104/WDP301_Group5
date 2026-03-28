export function saveToRecentlyViewed(productId) {
    const key = "recentlyViewed";

    let list = JSON.parse(localStorage.getItem(key)) || [];

    list = list.filter(id => id !== productId);

    list.unshift(productId);

    if (list.length > 10) {
        list = list.slice(0, 10);
    }

    localStorage.setItem(key, JSON.stringify(list));
}

export function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem("recentlyViewed")) || [];
}

export function removeRecentlyViewed(productId) {
    const key = "recentlyViewed";

    let list = JSON.parse(localStorage.getItem(key)) || [];

    list = list.filter(id => id !== productId);

    localStorage.setItem(key, JSON.stringify(list));
}

export function clearRecentlyViewed() {
    localStorage.removeItem("recentlyViewed");
}