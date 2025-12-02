# Homebrew Formula for Guardian

This directory contains the Homebrew formula for installing Guardian on macOS.

## Setup Instructions

To make Guardian available via Homebrew, you have two options:

### Option 1: Create a Homebrew Tap (Recommended)

1. Create a new repository named `homebrew-guardian` on GitHub
2. Push the `Formula/guardian.rb` file to the repository:
   ```bash
   git clone https://github.com/sahitya-chandra/homebrew-guardian.git
   cd homebrew-guardian
   mkdir -p Formula
   cp ../guardian/Formula/guardian.rb Formula/
   git add Formula/guardian.rb
   git commit -m "Add Guardian formula"
   git push
   ```
3. Users can then install via:
   ```bash
   brew tap sahitya-chandra/guardian
   brew install guardian
   ```

### Option 2: Submit to Homebrew Core

Submit this formula to the official Homebrew core repository. See [Contributing to Homebrew](https://docs.brew.sh/Contributing) for more information.

## Updating the Formula

When releasing a new version:

1. Update the version number in `guardian.rb`
2. Update the `url` to point to the new npm tarball
3. Calculate the SHA256:
   ```bash
   # Download the tarball
   curl -L https://registry.npmjs.org/guardian/-/guardian-<VERSION>.tgz -o guardian.tgz
   # Calculate SHA256
   shasum -a 256 guardian.tgz
   ```
4. Update the `sha256` field in the formula
5. Test locally:
   ```bash
   brew install --build-from-source Formula/guardian.rb
   ```

## Testing

Before submitting:

```bash
brew audit --strict Formula/guardian.rb
brew style Formula/guardian.rb
brew install --build-from-source Formula/guardian.rb
```

