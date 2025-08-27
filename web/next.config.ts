const nextConfig = {
	// Configure Turbopack root to avoid incorrect workspace inference
	turbopack: {
		root: __dirname,
	},
};

export default nextConfig;
