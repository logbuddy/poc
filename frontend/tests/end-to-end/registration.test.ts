import registrationPage from './PageModels/RegistrationPageModel';

fixture `Some description`
    .page `http://localhost:3000/#/register`;

test('Check if the email field works', async t => {
    await registrationPage.typeEmail('j.doe@example.com');
    await t.expect(registrationPage.emailInput.value).eql('j.doe@example.com');
});
