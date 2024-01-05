const oauth2 = require("simple-oauth2");

class OAuthClient {
    constructor({
        oauthOptions
    }) {
        this.client = new oauth2.ClientCredentials(oauthOptions)
        this.token = null;
    }

    async getToken() {
        try {
            if (this.token === null || this.token.expired()) {
                console.log('Generating token')
                const token = await this.client.getToken(null, { json: true })
                this.token = this.client.createToken(token)
            }
            console.log('token is not expired')
            return this._reduceToken(this.token)
        } catch (err) {
            console.error(`Failed to retrieve client credentials oauth token: ${err.message}`);
            throw err;
        }
    }

    _reduceToken(token) {
        return token.token.access_token;
    }
}

module.exports = OAuthClient;