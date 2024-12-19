module.exports = {
	apps: [
		{
			name: 'hpbd-em-pe-2024',
			script: 'server.js',
			instances: 'max',
			autorestart: true,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
