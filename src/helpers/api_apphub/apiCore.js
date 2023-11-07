import cockpit from 'cockpit';

class APICore {
    constructor() {
        this.address = "localhost";
        this.port = 80;
    }

    async getApiKey() {
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

    async request(method, path, params = null, body = null) {
        path = "/api" + path;

        let requestObject = {
            path: path,
            method: method,
            body: body ? JSON.stringify(body) : ""
        };

        if (params !== null) {
            requestObject.params = params;
        }

        return cockpit.http({
            "address": this.address,
            "port": this.port,
            "headers": {
                'Content-Type': 'application/json; charset=utf-8',
                'x-api-key': await this.getApiKey()
            }
        }).request(requestObject).then(function (response) {
            if (response) {
                return JSON.parse(response);
            }
            else {
                return null
            }
        }).catch(function (error, data) {
            if (data) {
                try {
                    data = JSON.parse(data);
                    error.message = data.details ? data.details : data;
                } catch (e) {
                    error.message = data;
                }
            }
            return Promise.reject(error);
        });
    }

    get(path, params) {
        return this.request("GET", path, params);
    }

    put(path, params, body) {
        return this.request("PUT", path, params, body);
    }

    post(path, params, body) {
        return this.request("POST", path, params, body);
    }

    delete(path, params) {
        return this.request("DELETE", path, params);
    }
}

export { APICore };
