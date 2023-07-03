import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  ProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';

import generator from './generator';
import { AnalogNxApplicationGeneratorOptions } from './schema';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { test } from 'vitest';

describe('nx-plugin generator', () => {
  const setup = async (
    options: AnalogNxApplicationGeneratorOptions,
    nxVersion = '16.1.0'
  ) => {
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addDependenciesToPackageJson(tree, {}, { nx: nxVersion });
    await generator(tree, options);
    const config = readProjectConfiguration(tree, options.analogAppName);
    return {
      tree,
      config,
    };
  };

  const verifyCoreDependenciesNxV16_0_0_AngularV15_X = (
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ) => {
    expect(dependencies['@analogjs/content']).toBe('0.1.9');
    expect(dependencies['@analogjs/router']).toBe('0.1.0-alpha.10');
    expect(dependencies['@angular/platform-server']).toBe(
      dependencies['@angular/core']
    );
    expect(dependencies['front-matter']).toBe('^4.0.2');
    expect(dependencies['marked']).toBe('^4.2.4');
    expect(dependencies['prismjs']).toBe('^1.29.0');

    expect(devDependencies['@nx/devkit']).toBe('~16.0.0');
    expect(devDependencies['@nx/angular']).toBe('~16.0.0');
    expect(devDependencies['@analogjs/platform']).toBe('0.1.0-beta.22');
    expect(devDependencies['@analogjs/vite-plugin-angular']).toBe(
      '0.2.0-alpha.29'
    );
    expect(devDependencies['@nx/vite']).toBe('~16.0.0');
    expect(devDependencies['jsdom']).toBe('^20.0.0');
    expect(devDependencies['vite']).toBe('^4.0.3');
    expect(devDependencies['vite-tsconfig-paths']).toBe('^4.0.2');
    expect(devDependencies['vitest']).toBe('^0.31.0');
  };

  const verifyCoreDependenciesAngularV16_X = (
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ) => {
    expect(dependencies['@analogjs/content']).toBe('^0.2.0-beta.22');
    expect(dependencies['@analogjs/router']).toBe('^0.2.0-beta.22');
    expect(dependencies['@angular/platform-server']).toBe(
      dependencies['@angular/core']
    );
    expect(dependencies['front-matter']).toBe('^4.0.2');
    expect(dependencies['marked']).toBe('^5.0.2');
    expect(dependencies['marked-gfm-heading-id']).toBe('^3.0.4');
    expect(dependencies['marked-highlight']).toBe('^2.0.1');
    expect(dependencies['prismjs']).toBe('^1.29.0');

    expect(devDependencies['@nx/devkit']).toBe('^16.4.0');
    expect(devDependencies['@nx/angular']).toBe('^16.4.0');
    expect(devDependencies['@analogjs/platform']).toBe('^0.2.0-beta.22');
    expect(devDependencies['@analogjs/vite-plugin-angular']).toBe(
      '^0.2.0-beta.22'
    );
    expect(devDependencies['@nx/vite']).toBe('^16.4.0');
    expect(devDependencies['jsdom']).toBe('^22.0.0');
    expect(devDependencies['vite']).toBe('^4.3.9');
    expect(devDependencies['vite-tsconfig-paths']).toBe('^4.2.0');
    expect(devDependencies['vitest']).toBe('^0.32.2');
  };

  const verifyConfig = (config: ProjectConfiguration, name: string) => {
    expect(config.projectType).toBe('application');
    expect(config.root).toBe('apps/' + name);
  };

  const verifyHomePageExists = (tree: Tree, appName: string) => {
    const hasHomePageFile = tree.exists(
      `apps/${appName}/src/app/pages/(home).page.ts`
    );
    const hasWelcomeComponentFile = tree.exists(
      `apps/${appName}/src/app/pages/analog-welcome.component.ts`
    );
    expect(hasHomePageFile).toBeTruthy();
    expect(hasWelcomeComponentFile).toBeTruthy();
  };

  const verifyTailwindIsSetUp = (
    tree: Tree,
    devDependencies: Record<string, string>
  ) => {
    expect(devDependencies['tailwindcss']).toBeDefined();
    const hasTailwindConfigFile = tree.exists(
      'apps/tailwind-app/tailwind.config.js'
    );
    const hasPostCSSConfigFile = tree.exists(
      'apps/tailwind-app/postcss.config.js'
    );
    expect(hasTailwindConfigFile).toBeTruthy();
    expect(hasPostCSSConfigFile).toBeTruthy();
  };

  const verifyTrpcIsSetUp = (
    tree: Tree,
    dependencies: Record<string, string>
  ) => {
    expect(dependencies['@analogjs/trpc']).toBeDefined();
    const hasTrpcClientFile = tree.exists('apps/trpc-app/src/trpc-client.ts');
    const hasNoteFile = tree.exists('apps/trpc-app/src/note.ts');
    const hasTrpcServerRoute = tree.exists(
      'apps/trpc-app/src/server/routes/trpc/[trpc].ts'
    );
    expect(hasTrpcClientFile).toBeTruthy();
    expect(hasNoteFile).toBeTruthy();
    expect(hasTrpcServerRoute).toBeTruthy();

    const providesTrpcClient = tree
      .read('apps/trpc-app/src/app/app.config.ts')
      .includes('provideTrpcClient');
    const injectsTrpcClient = tree
      .read('apps/trpc-app/src/app/pages/analog-welcome.component.ts')
      .includes('injectTrpcClient');
    expect(providesTrpcClient).toBeTruthy();
    expect(injectsTrpcClient).toBeTruthy();
  };

  const verifyTrpcIsNotSetUp = (
    tree: Tree,
    dependencies: Record<string, string>
  ) => {
    expect(dependencies['@analogjs/trpc']).not.toBeDefined();
    const hasTrpcClientFile = tree.exists('apps/trpc-app/src/trpc-client.ts');
    const hasNoteFile = tree.exists('apps/trpc-app/src/note.ts');
    const hasTrpcServerRoute = tree.exists(
      'apps/trpc-app/src/server/routes/trpc/[trpc].ts'
    );
    expect(hasTrpcClientFile).toBeFalsy();
    expect(hasNoteFile).toBeFalsy();
    expect(hasTrpcServerRoute).toBeFalsy();

    const providesTrpcClient = tree
      .read('apps/trpc-app/src/app/app.config.ts')
      .includes('provideTrpcClient');
    const injectsTrpcClient = tree
      .read('apps/trpc-app/src/app/pages/analog-welcome.component.ts')
      .includes('injectTrpcClient');
    expect(providesTrpcClient).toBeFalsy();
    expect(injectsTrpcClient).toBeFalsy();
  };

  describe('Nx latest, Angular 16.x', () => {
    it('creates a default analogjs app in the source directory', async () => {
      const analogAppName = 'analog';
      const { config, tree } = await setup({ analogAppName });
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesAngularV16_X(dependencies, devDependencies);

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);
    });

    it('creates an analogjs app in the source directory with tailwind set up', async () => {
      const analogAppName = 'tailwind-app';
      const { config, tree } = await setup({
        analogAppName,
        addTailwind: true,
      });
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesAngularV16_X(dependencies, devDependencies);

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);

      verifyTailwindIsSetUp(tree, devDependencies);
    });

    it('creates an analogjs app in the source directory with trpc set up', async () => {
      const analogAppName = 'trpc-app';
      const { config, tree } = await setup({ analogAppName, addTRPC: true });
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesAngularV16_X(dependencies, devDependencies);

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);
      verifyTrpcIsSetUp(tree, dependencies);
    });
  });

  describe('Nx 16.0.0, Angular ~15.2.0', () => {
    it('creates a default analogjs app in the source directory', async () => {
      const analogAppName = 'analog';
      const { config, tree } = await setup({ analogAppName }, '16.0.0');
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesNxV16_0_0_AngularV15_X(
        dependencies,
        devDependencies
      );

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);
    });

    it('creates an analogjs app in the source directory with tailwind set up', async () => {
      const analogAppName = 'tailwind-app';
      const { config, tree } = await setup(
        {
          analogAppName,
          addTailwind: true,
        },
        '16.0.0'
      );
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesNxV16_0_0_AngularV15_X(
        dependencies,
        devDependencies
      );

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);

      verifyTailwindIsSetUp(tree, devDependencies);
    });

    it('creates an analogjs app in the source directory without trpc due to unsupported Nx version', async () => {
      const analogAppName = 'trpc-app';
      const { config, tree } = await setup(
        { analogAppName, addTRPC: true },
        '16.0.0'
      );
      const { dependencies, devDependencies } = readJson(tree, 'package.json');

      verifyCoreDependenciesNxV16_0_0_AngularV15_X(
        dependencies,
        devDependencies
      );

      verifyConfig(config, analogAppName);

      verifyHomePageExists(tree, analogAppName);
      verifyTrpcIsNotSetUp(tree, dependencies);
    });
  });

  describe('Nx 15.1.0', () => {
    test('should error out due to unsupported Nx version', async () => {
      const analogAppName = 'analog';
      await expect(setup({ analogAppName }, '15.1.0')).rejects.toThrow(
        'Nx v15.2.0 or newer is required to install Analog'
      );
    });
  });
});
