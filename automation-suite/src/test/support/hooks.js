const { Before, After } = require('@cucumber/cucumber');

Before(async function () {
    await this.init(); 
});

After(async function () {
    if (this.request) {
        await this.request.dispose();
    }
});