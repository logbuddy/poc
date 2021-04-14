import { t, Selector } from 'testcafe';

class Page {
    emailInput: Selector;

    constructor () {
        this.emailInput = Selector('input').withAttribute('data-testid', 'email-input');
    }

    async typeEmail(email) {
        await t.typeText(this.emailInput, email);
    }
}

export default new Page();
