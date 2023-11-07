import axios from 'axios';
import cockpit from 'cockpit';

// content type
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.baseURL = `${window.location.protocol}//${window.location.hostname}/api`;

const getApiKey = async () => {
    try {
        var script = "docker exec -i websoft9-apphub apphub getconfig --section api_key --key key";
        const api_key = (await cockpit.spawn(["/bin/bash", "-c", script])).trim();
        if (!api_key) {
            return Promise.reject(new Error("Api Key Not Set"))
        }
        return api_key
    }
    catch (error) {
        return Promise.reject("Get The Apphub's Api Key Error");
    }
}

// intercepting to capture errors
axios.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response.data;
        }
        // else if (response.status === 204) {
        //     return null;
        // }
    },
    (error) => {
        console.log(error);
        console.log(error.response);
        error.message = error.response?.data?.details || error.message || "Unknown Error";
        // throw error;
        return Promise.reject(error);
    }
);

class APICore {
    constructor() {
        this.init();
    }

    init = async () => {
        axios.defaults.headers.common['x-api-key'] = await getApiKey();
    }

    get = (url, params) => {
        return axios.get(url, { params });
    };

    post = (url, params, data) => {
        return axios.post(url, data, { params });
    };

    put = (url, params, data) => {
        return axios.put(url, data, { params });
    };

    delete = (url, params) => {
        return axios.delete(url, { params });
    };
}

export { APICore };
