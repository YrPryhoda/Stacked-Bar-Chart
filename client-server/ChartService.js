class ChartService {
    url = 'http://127.0.0.1:3000/';

    async loadForms(lang) {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                body: lang
            })
            return await response.json();
        } catch (e) {
            console.log(e.message)
        }
    }

    async getChartConfig() {
        try {
            const response = await fetch(`${this.url}config`)
            const data = await response.json();

            if (data.cities && data.cities.length) {
                data.cities = JSON.parse(data.cities);
            }

            return data;
        } catch (e) {
            console.log(e.message)
        }
    }

    async setLangOrSpec(value) {
        try {
            const response = await fetch(`${this.url}config`, {
                method: 'POST',
                body: value
            })
            return await response.text();
        } catch (e) {
            console.log(e.message)
        }
    }

    async setCities(arr) {
        try {
            const response = await fetch(`${this.url}cities`, {
                method: 'POST',
                body: JSON.stringify(arr)
            })
            return await response.json();
        } catch (e) {
            console.log(e.message)
        }
    }
}


export default new ChartService;