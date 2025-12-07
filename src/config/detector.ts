import path from 'node:path';
import fs from 'fs-extra';
import { globby } from 'globby';

export interface ProjectAnalysis {
  languages: string[];
  packageManagers: string[];
  frameworks: string[];
  hasLargeFiles: boolean;
  detectedConfigFiles: string[];
}

interface LanguageDefinition {
  name: string;
  extensions: string[];
  packageManagers?: string[];
  frameworks?: string[];
  configFiles?: string[];
}

const LANGUAGE_DEFINITIONS: LanguageDefinition[] = [
  {
    name: 'typescript',
    extensions: ['.ts', '.tsx', '.d.ts'],
    packageManagers: ['npm', 'yarn', 'pnpm'],
    frameworks: ['nextjs', 'react', 'angular', 'vue', 'nest', 'express'],
    configFiles: ['tsconfig.json', 'next.config.js', 'next.config.ts'],
  },
  {
    name: 'javascript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    packageManagers: ['npm', 'yarn', 'pnpm'],
    frameworks: ['react', 'vue', 'express', 'nextjs'],
    configFiles: ['package.json', 'webpack.config.js', 'vite.config.js'],
  },
  {
    name: 'python',
    extensions: ['.py', '.pyw', '.pyi'],
    packageManagers: ['pip', 'poetry', 'pipenv', 'conda'],
    frameworks: ['django', 'flask', 'fastapi', 'pytest'],
    configFiles: [
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'Pipfile',
      'poetry.lock',
      'manage.py',
    ],
  },
  {
    name: 'go',
    extensions: ['.go'],
    packageManagers: ['go'],
    frameworks: ['gin', 'echo', 'fiber'],
    configFiles: ['go.mod', 'go.sum', 'Gopkg.toml'],
  },
  {
    name: 'rust',
    extensions: ['.rs'],
    packageManagers: ['cargo'],
    frameworks: ['actix', 'rocket', 'axum'],
    configFiles: ['Cargo.toml', 'Cargo.lock'],
  },
  {
    name: 'java',
    extensions: ['.java', '.kt', '.scala'],
    packageManagers: ['maven', 'gradle', 'sbt'],
    frameworks: ['spring', 'javafx', 'android'],
    configFiles: ['pom.xml', 'build.gradle', 'build.sbt', 'settings.gradle'],
  },
  {
    name: 'cpp',
    extensions: ['.cpp', '.cxx', '.cc', '.c++', '.hpp', '.hxx', '.h++'],
    packageManagers: ['cmake', 'conan'],
    frameworks: ['qt', 'boost'],
    configFiles: ['CMakeLists.txt', 'Makefile', 'conanfile.txt'],
  },
  {
    name: 'c',
    extensions: ['.c', '.h'],
    packageManagers: ['cmake', 'make'],
    configFiles: ['CMakeLists.txt', 'Makefile', 'configure'],
  },
  {
    name: 'ruby',
    extensions: ['.rb', '.rake'],
    packageManagers: ['bundler', 'gem'],
    frameworks: ['rails', 'sinatra'],
    configFiles: ['Gemfile', 'Gemfile.lock', 'Rakefile'],
  },
  {
    name: 'php',
    extensions: ['.php', '.phtml'],
    packageManagers: ['composer'],
    frameworks: ['laravel', 'symfony', 'wordpress'],
    configFiles: ['composer.json', 'composer.lock'],
  },
  {
    name: 'swift',
    extensions: ['.swift'],
    packageManagers: ['swiftpm', 'cocoapods'],
    frameworks: ['swiftui', 'uikit'],
    configFiles: ['Package.swift', 'Podfile'],
  },
  {
    name: 'kotlin',
    extensions: ['.kt', '.kts'],
    packageManagers: ['gradle', 'maven'],
    frameworks: ['android', 'spring'],
    configFiles: ['build.gradle.kts', 'pom.xml'],
  },
  {
    name: 'scala',
    extensions: ['.scala', '.sc'],
    packageManagers: ['sbt', 'maven'],
    frameworks: ['play', 'akka'],
    configFiles: ['build.sbt', 'pom.xml'],
  },
  {
    name: 'dart',
    extensions: ['.dart'],
    packageManagers: ['pub'],
    frameworks: ['flutter'],
    configFiles: ['pubspec.yaml', 'pubspec.lock'],
  },
  {
    name: 'html',
    extensions: ['.html', '.htm', '.xhtml'],
  },
  {
    name: 'css',
    extensions: ['.css', '.scss', '.sass', '.less', '.styl'],
  },
  {
    name: 'sql',
    extensions: ['.sql'],
  },
  {
    name: 'shell',
    extensions: ['.sh', '.bash', '.zsh', '.fish'],
  },
  {
    name: 'yaml',
    extensions: ['.yaml', '.yml'],
  },
  {
    name: 'toml',
    extensions: ['.toml'],
  },
  {
    name: 'json',
    extensions: ['.json'],
  },
  {
    name: 'xml',
    extensions: ['.xml'],
  },
  {
    name: 'markdown',
    extensions: ['.md', '.markdown', '.mdx'],
  },
  {
    name: 'docker',
    extensions: ['.dockerfile'],
    configFiles: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
  },
];

const FRAMEWORK_INDICATORS: Record<string, string[]> = {
  nextjs: ['next.config.js', 'next.config.ts', '.next'],
  react: ['package.json'],
  django: ['manage.py', 'settings.py', 'wsgi.py'],
  flask: ['flask', 'app.py'], // Check for flask import
  rails: ['Gemfile', 'config.ru', 'app/models'],
  laravel: ['artisan', 'app/Http'],
  spring: ['pom.xml', 'application.properties'],
  android: ['AndroidManifest.xml', 'build.gradle'],
  flutter: ['pubspec.yaml', 'lib/main.dart'],
};

/**
 * Analyzes codebase to detect languages, package managers, and frameworks
 */
export async function analyzeProject(cwd: string): Promise<ProjectAnalysis> {
  const languages = new Set<string>();
  const packageManagers = new Set<string>();
  const frameworks = new Set<string>();
  const detectedConfigFiles: string[] = [];
  let hasLargeFiles = false;

  try {
    const allFiles = await globby(['**/*'], {
      cwd,
      gitignore: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.codexa/**'],
      onlyFiles: true,
      absolute: false,
    });

    const extensionMap = new Map<string, number>();
    const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

    for (const file of allFiles) {
      const ext = path.extname(file).toLowerCase();
      if (ext) {
        extensionMap.set(ext, (extensionMap.get(ext) || 0) + 1);
      }

      // large file check
      try {
        const filePath = path.join(cwd, file);
        const stats = await fs.stat(filePath);
        if (stats.size > LARGE_FILE_THRESHOLD) {
          hasLargeFiles = true;
        }
      } catch {
        // Ignore errors (file might not exist, permission issues, etc.)
      }
    }

    for (const lang of LANGUAGE_DEFINITIONS) {
      const hasExtension = lang.extensions.some((ext) => extensionMap.has(ext));
      if (hasExtension) {
        languages.add(lang.name);
        if (lang.packageManagers) {
          lang.packageManagers.forEach((pm) => packageManagers.add(pm));
        }
      }
    }

    const configFileChecks = [
      'package.json', // npm/yarn/pnpm
      'package-lock.json', // npm
      'yarn.lock', // yarn
      'pnpm-lock.yaml', // pnpm
      'requirements.txt', // pip
      'pyproject.toml', // poetry
      'Pipfile', // pipenv
      'go.mod', // go
      'Cargo.toml', // cargo
      'pom.xml', // maven
      'build.gradle', // gradle
      'build.sbt', // sbt
      'Gemfile', // bundler
      'composer.json', // composer
      'pubspec.yaml', // pub (dart/flutter)
      'CMakeLists.txt', // cmake
      'Makefile', // make
      'Dockerfile', // docker
      'docker-compose.yml',
      'docker-compose.yaml',
    ];

    for (const configFile of configFileChecks) {
      const configPath = path.join(cwd, configFile);
      if (await fs.pathExists(configPath)) {
        detectedConfigFiles.push(configFile);

        if (configFile === 'package.json' || configFile === 'package-lock.json') {
          packageManagers.add('npm');
        } else if (configFile === 'yarn.lock') {
          packageManagers.add('yarn');
        } else if (configFile === 'pnpm-lock.yaml') {
          packageManagers.add('pnpm');
        } else if (configFile === 'requirements.txt' || configFile === 'setup.py') {
          packageManagers.add('pip');
        } else if (configFile === 'pyproject.toml' || configFile === 'poetry.lock') {
          packageManagers.add('poetry');
        } else if (configFile === 'Pipfile') {
          packageManagers.add('pipenv');
        } else if (configFile === 'go.mod') {
          packageManagers.add('go');
        } else if (configFile === 'Cargo.toml') {
          packageManagers.add('cargo');
        } else if (configFile === 'pom.xml') {
          packageManagers.add('maven');
        } else if (configFile === 'build.gradle' || configFile === 'settings.gradle') {
          packageManagers.add('gradle');
        } else if (configFile === 'build.sbt') {
          packageManagers.add('sbt');
        } else if (configFile === 'Gemfile') {
          packageManagers.add('bundler');
        } else if (configFile === 'composer.json') {
          packageManagers.add('composer');
        } else if (configFile === 'pubspec.yaml') {
          packageManagers.add('pub');
        } else if (configFile === 'CMakeLists.txt') {
          packageManagers.add('cmake');
        }
      }
    }

    for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
      for (const indicator of indicators) {
        const indicatorPath = path.join(cwd, indicator);
        if (await fs.pathExists(indicatorPath)) {
          frameworks.add(framework);
          break;
        }
      }
    }

    // Special case: Check package.json for framework dependencies
    const packageJsonPath = path.join(cwd, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };
        const depNames = Object.keys(deps).map((d) => d.toLowerCase());

        if (depNames.some((d) => d.includes('react'))) {
          frameworks.add('react');
        }
        if (depNames.some((d) => d.includes('next'))) {
          frameworks.add('nextjs');
        }
        if (depNames.some((d) => d.includes('angular'))) {
          frameworks.add('angular');
        }
        if (depNames.some((d) => d.includes('vue'))) {
          frameworks.add('vue');
        }
        if (depNames.some((d) => d.includes('nestjs'))) {
          frameworks.add('nest');
        }
        if (depNames.some((d) => d.includes('express'))) {
          frameworks.add('express');
        }
      } catch {
        // Ignore JSON parse err
      }
    }
  } catch (error) {
    console.warn(
      `Project analysis warning: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    languages: Array.from(languages).sort(),
    packageManagers: Array.from(packageManagers).sort(),
    frameworks: Array.from(frameworks).sort(),
    hasLargeFiles,
    detectedConfigFiles: detectedConfigFiles.sort(),
  };
}
