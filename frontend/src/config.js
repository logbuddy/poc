const config = {
    backendApiBaseUri: 'https://rs213s9yml.execute-api.eu-central-1.amazonaws.com',
};

if (process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV === 'development') {
    config.backendApiBaseUri += '/dev';
}

export default config;
