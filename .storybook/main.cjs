const { resolve } = require("path");
const { loadConfigFromFile, mergeConfig } = require("vite"); // use `mergeConfig` to recursively merge Vite options;

module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-svelte-csf",
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  /**
   * A option exposed by storybook-builder-vite for customising the Vite config.
   * @see https://github.com/eirslett/storybook-builder-vite#customize-vite-config
   * @param {import("vite").UserConfig} config
   * @see https://vitejs.dev/config/
   */
  async viteFinal(config, { configType }) {
    const { config: userConfig } = await loadConfigFromFile(
      resolve(__dirname, "../vite.config.ts"),
    );

    userConfig.resolve.alias['../src/stores/wallet.ts'] = require.resolve('../__mocks__/stores/wallet.ts');
    // userConfig.resolve.modules = [path.resolve(__dirname, "../__mocks__"), ...config.resolve.modules]

    return mergeConfig(config, {
      ...userConfig,
      // manually specify plugins to avoid conflict
      plugins: [],
    });
  },
};
