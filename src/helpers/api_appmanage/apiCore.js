import cockpit from 'cockpit';

var IP;

class APICore {
    get = async (url, params) => {
        let http = response = cockpit.http({
            "address": "websoft9-appmanage",
            "port": 5000,
        });

        let response;
        if (params) {
            var queryString = params
                ? Object.keys(params)
                    .map((key) => key + '=' + params[key])
                    .join('&')
                : '';
            response = http.get(`${url}?${queryString}`, params);
        } else {
            response = http.get(`${url}`, params);
        }
        return response;
    };
}

export { APICore };
