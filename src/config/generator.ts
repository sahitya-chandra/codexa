import { ProjectAnalysis } from './detector';
import { AgentConfig } from '../types';

// Language-specific file extensions for inclusion
const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  typescript: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
  javascript: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  python: ['**/*.py', '**/*.pyw', '**/*.pyi'],
  go: ['**/*.go'],
  rust: ['**/*.rs'],
  java: ['**/*.java'],
  kotlin: ['**/*.kt', '**/*.kts'],
  scala: ['**/*.scala', '**/*.sc'],
  cpp: ['**/*.cpp', '**/*.cxx', '**/*.cc', '**/*.c++', '**/*.hpp', '**/*.hxx', '**/*.h++'],
  c: ['**/*.c', '**/*.h'],
  ruby: ['**/*.rb', '**/*.rake'],
  php: ['**/*.php', '**/*.phtml'],
  swift: ['**/*.swift'],
  dart: ['**/*.dart'],
  html: ['**/*.html', '**/*.htm', '**/*.xhtml'],
  css: ['**/*.css', '**/*.scss', '**/*.sass', '**/*.less'],
  sql: ['**/*.sql'],
  shell: ['**/*.sh', '**/*.bash', '**/*.zsh', '**/*.fish'],
  yaml: ['**/*.yaml', '**/*.yml'],
  toml: ['**/*.toml'],
  json: ['**/*.json'],
  xml: ['**/*.xml'],
  markdown: ['**/*.md', '**/*.markdown', '**/*.mdx'],
  docker: ['**/Dockerfile*', '**/docker-compose*.yml', '**/docker-compose*.yaml'],
};

// Important config/documentation files to always include
const IMPORTANT_CONFIG_FILES = [
  '**/README*.md',
  '**/README*.txt',
  '**/CHANGELOG*.md',
  '**/LICENSE*',
  '**/CONTRIBUTING*.md',
  '**/*.config.js',
  '**/*.config.ts',
  '**/*.config.json',
  '**/tsconfig*.json',
  '**/package.json',
  '**/go.mod',
  '**/Cargo.toml',
  '**/pom.xml',
  '**/build.gradle*',
  '**/requirements.txt',
  '**/pyproject.toml',
  '**/Gemfile',
  '**/composer.json',
  '**/pubspec.yaml',
  '**/CMakeLists.txt',
  '**/Makefile',
  '**/.env.example',
  '**/.gitignore',
  '**/.dockerignore',
];

// Common exclude patterns (language-agnostic)
const COMMON_EXCLUDES = [
  '.git/**',
  '.codexa/**',
  '.codexarc.json',
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/*.log',
  '**/.vscode/**',
  '**/.idea/**',
  '**/.vs/**',
  '**/*.swp',
  '**/*.swo',
  '**/*~',
  '**/.cache/**',
  '**/.tmp/**',
  '**/.temp/**',
];

// Language-specific exclude patterns
const LANGUAGE_EXCLUDES: Record<string, string[]> = {
  javascript: [
    'node_modules/**',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'dist/**',
    'build/**',
    '.next/**',
    '.nuxt/**',
    '.output/**',
    '.vuepress/dist/**',
    '.vitepress/dist/**',
    'coverage/**',
    '.nyc_output/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/*.chunk.js',
  ],
  typescript: [
    'node_modules/**',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'dist/**',
    'build/**',
    '.next/**',
    '.nuxt/**',
    '.output/**',
    '.vuepress/dist/**',
    '.vitepress/dist/**',
    'coverage/**',
    '.nyc_output/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/*.chunk.js',
    '**/*.d.ts.map',
  ],
  python: [
    '**/__pycache__/**',
    '**/*.pyc',
    '**/*.pyo',
    '**/*.pyd',
    '**/.Python',
    '**/venv/**',
    '**/.venv/**',
    '**/env/**',
    '**/.env/**',
    '**/ENV/**',
    '**/virtualenv/**',
    '**/.mypy_cache/**',
    '**/.pytest_cache/**',
    '**/.ruff_cache/**',
    '**/*.egg-info/**',
    '**/dist/**',
    '**/build/**',
    '**/.eggs/**',
    '**/htmlcov/**',
    '**/.tox/**',
    '**/.coverage',
    '**/.coverage.*',
  ],
  go: [
    'vendor/**',
    '**/*.exe',
    '**/*.test',
    '**/*.out',
    '**/go.sum', // Optional: can be included if needed
  ],
  rust: [
    'target/**',
    '**/Cargo.lock', // Optional: can be included if needed
  ],
  java: [
    'target/**',
    '.gradle/**',
    '**/*.class',
    '**/*.jar',
    '**/*.war',
    '**/*.ear',
    '**/out/**',
    '**/.idea/**',
    '**/*.iml',
    '**/build/**',
    '**/.metadata/**',
  ],
  kotlin: [
    'target/**',
    '.gradle/**',
    '**/*.class',
    '**/*.jar',
    '**/out/**',
    '**/.idea/**',
    '**/*.iml',
    '**/build/**',
  ],
  scala: [
    'target/**',
    '**/*.class',
    '**/*.jar',
    'project/target/**',
    'project/project/**',
    '.metals/**',
  ],
  cpp: [
    'build/**',
    'cmake-build-*/**',
    '**/*.o',
    '**/*.so',
    '**/*.dylib',
    '**/*.dll',
    '**/*.exe',
    '**/*.a',
    '**/*.lib',
    '**/Debug/**',
    '**/Release/**',
    '**/x64/**',
    '**/x86/**',
  ],
  c: [
    'build/**',
    'cmake-build-*/**',
    '**/*.o',
    '**/*.so',
    '**/*.dylib',
    '**/*.dll',
    '**/*.exe',
    '**/*.a',
    '**/*.lib',
    '**/Debug/**',
    '**/Release/**',
    '**/x64/**',
    '**/x86/**',
  ],
  ruby: [
    'vendor/bundle/**',
    '**/.bundle/**',
    '**/tmp/**',
    '**/log/**',
    '**/*.gem',
    '**/.byebug_history',
    '**/coverage/**',
  ],
  php: [
    'vendor/**',
    '**/composer.lock', // Optional
    '**/storage/**',
    '**/bootstrap/cache/**',
  ],
  swift: [
    '.build/**',
    '**/*.xcodeproj/**',
    '**/*.xcworkspace/**',
    '**/DerivedData/**',
    '**/*.swiftmodule',
    '**/*.swiftdoc',
  ],
  dart: [
    '.dart_tool/**',
    'build/**',
    '**/.flutter-plugins',
    '**/.flutter-plugins-dependencies',
    '**/.packages',
    '**/.pub-cache/**',
  ],
  docker: [],
};

/**
 * Generates optimized include patterns based on detected languages
 */
function generateIncludePatterns(analysis: ProjectAnalysis): string[] {
  const includes = new Set<string>();

  for (const lang of analysis.languages) {
    const patterns = LANGUAGE_EXTENSIONS[lang];
    if (patterns) {
      patterns.forEach((pattern) => includes.add(pattern));
    }
  }

  // Always include important config/documentation files
  IMPORTANT_CONFIG_FILES.forEach((pattern) => includes.add(pattern));

  // If no languages detected, use sensible defaults
  if (includes.size === 0) {
    return [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.py',
      '**/*.go',
      '**/*.rs',
      '**/*.java',
      '**/*.md',
      ...IMPORTANT_CONFIG_FILES,
    ];
  }

  return Array.from(includes).sort();
}

/**
 * Generates optimized exclude patterns based on detected languages
 */
function generateExcludePatterns(analysis: ProjectAnalysis): string[] {
  const excludes = new Set<string>();

  COMMON_EXCLUDES.forEach((pattern) => excludes.add(pattern));

  for (const lang of analysis.languages) {
    const patterns = LANGUAGE_EXCLUDES[lang];
    if (patterns) {
      patterns.forEach((pattern) => excludes.add(pattern));
    }
  }

  for (const pm of analysis.packageManagers) {
    switch (pm) {
      case 'npm':
        excludes.add('node_modules/**');
        excludes.add('package-lock.json');
        break;
      case 'yarn':
        excludes.add('node_modules/**');
        excludes.add('yarn.lock');
        break;
      case 'pnpm':
        excludes.add('node_modules/**');
        excludes.add('pnpm-lock.yaml');
        break;
      case 'pip':
        excludes.add('venv/**');
        excludes.add('.venv/**');
        excludes.add('env/**');
        break;
      case 'poetry':
        excludes.add('.venv/**');
        break;
      case 'pipenv':
        excludes.add('.venv/**');
        break;
      case 'go':
        excludes.add('vendor/**');
        break;
      case 'cargo':
        excludes.add('target/**');
        break;
      case 'gradle':
        excludes.add('.gradle/**');
        excludes.add('build/**');
        break;
      case 'maven':
        excludes.add('target/**');
        break;
      case 'sbt':
        excludes.add('target/**');
        break;
    }
  }

  for (const framework of analysis.frameworks) {
    switch (framework) {
      case 'nextjs':
        excludes.add('.next/**');
        break;
      case 'react':
        // Already covered by JS/TS excludes
        break;
      case 'django':
        excludes.add('**/__pycache__/**');
        excludes.add('**/*.pyc');
        break;
    }
  }

  // Remove duplicates and sort
  return Array.from(excludes).sort();
}

/**
 * Generates a dynamic config based on project analysis
 */
export function generateConfig(
  analysis: ProjectAnalysis,
  baseConfig?: Partial<AgentConfig>,
): AgentConfig {
  const includeGlobs = generateIncludePatterns(analysis);
  const excludeGlobs = generateExcludePatterns(analysis);

  // Start with base config or defaults
  const config: AgentConfig = {
    modelProvider: 'groq',
    model: 'llama-3.1-8b-instant',
    embeddingProvider: 'local',
    embeddingModel: 'Xenova/all-MiniLM-L6-v2',
    maxChunkSize: 800,
    chunkOverlap: 100,
    includeGlobs,
    excludeGlobs,
    historyDir: '.codexa/sessions',
    dbPath: '.codexa/index.db',
    temperature: 0.2,
    topK: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB default
    skipBinaryFiles: true,
    skipLargeFiles: true,
    ...baseConfig,
  };

  // Merge include/exclude patterns if base config provides them
  if (baseConfig?.includeGlobs) {
    // Merge user-specified includes with detected ones
    config.includeGlobs = Array.from(new Set([...includeGlobs, ...baseConfig.includeGlobs])).sort();
  }

  if (baseConfig?.excludeGlobs) {
    // Merge user-specified excludes with detected ones
    config.excludeGlobs = Array.from(new Set([...excludeGlobs, ...baseConfig.excludeGlobs])).sort();
  }

  return config;
}

