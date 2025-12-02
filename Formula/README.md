# Homebrew Formula for Codexa

This directory contains the Homebrew formula for installing Codexa on macOS.

## Setup Instructions

To make Codexa available via Homebrew, you have two options:

### Option 1: Create a Homebrew Tap (Recommended)

1. Create a new repository named `homebrew-codexa` on GitHub
2. Push the `Formula/codexa.rb` file to the repository:
   ```bash
   git clone https://github.com/sahitya-chandra/homebrew-codexa.git
   cd homebrew-codexa
   mkdir -p Formula
   cp ../codexa/Formula/codexa.rb Formula/
   git add Formula/codexa.rb
   git commit -m "Add Codexa formula"
   git push
   ```
3. Users can then install via:
   ```bash
   brew tap sahitya-chandra/codexa
   brew install codexa
   ```

### Option 2: Submit to Homebrew Core

Submit this formula to the official Homebrew core repository. See [Contributing to Homebrew](https://docs.brew.sh/Contributing) for more information.

## Updating the Formula

When releasing a new version:

1. Update the version number in `codexa.rb`
2. Update the `url` to point to the new npm tarball
3. Calculate the SHA256:
   ```bash
   # Download the tarball
   curl -L https://registry.npmjs.org/codexa/-/codexa-<VERSION>.tgz -o codexa.tgz
   # Calculate SHA256
   shasum -a 256 codexa.tgz
   ```
4. Update the `sha256` field in the formula
5. Test locally:
   ```bash
   brew install --build-from-source Formula/codexa.rb
   ```

## Testing

Before submitting:

```bash
brew audit --strict Formula/codexa.rb
brew style Formula/codexa.rb
brew install --build-from-source Formula/codexa.rb
```

