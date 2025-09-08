const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// パスエイリアスを追加
config.resolver.alias = {
	"@": path.resolve(__dirname, "src"),
	"@components": path.resolve(__dirname, "src/components"),
	"@hooks": path.resolve(__dirname, "src/hooks"),
	"@lib": path.resolve(__dirname, "src/lib"),
	"@services": path.resolve(__dirname, "src/services"),
	"@stores": path.resolve(__dirname, "src/stores"),
	"@types": path.resolve(__dirname, "src/types"),
	"@utils": path.resolve(__dirname, "src/utils"),
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
