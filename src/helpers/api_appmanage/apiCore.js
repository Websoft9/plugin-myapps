import cockpit from 'cockpit';

var IP;

class APICore {
    getIp = async () => {
        if (!IP) {
            cockpit.spawn(["docker", "inspect", "-f", "{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}", "websoft9-appmanage"]).then((data) => {
                IP = data.trim();
            }).catch((error) => {
                throw new Error(`Docker command failed: ${error}`);
            })
        }
        return IP;
    }

    get = async (url, params) => {
        await this.getIp();
        let http = response = cockpit.http({
            "address": IP,
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
