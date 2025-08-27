const nextConfig = {
	// Configure Turbopack root to avoid incorrect workspace inference
	turbopack: {
		root: __dirname,
	},
	// Allow access from LAN IP during dev to avoid warnings about cross-origin
	allowedDevOrigins: ["http://localhost:3000", "http://192.168.80.157:3000"],
};

export default nextConfig;
