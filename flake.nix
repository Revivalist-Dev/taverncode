{
  description = "Tavern development flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "aarch64-linux"
        "x86_64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forEachSystem = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
      rev = self.shortRev or self.dirtyShortRev or "dirty";
    in
    {
      devShells = forEachSystem (pkgs: {
        default =
          let
            bun = pkgs.callPackage ./nix/bun.nix { };

            tavern-dev = pkgs.writeShellScriptBin "tavern-dev" ''
              set -euo pipefail

              : "''${TAVERN_ROOT:?TAVERN_ROOT is not set. Enter the flake dev shell from the repo root.}"
              export TAVERN_DEV_CWD="$PWD"
              exec ${bun}/bin/bun --cwd "$TAVERN_ROOT/packages/opencode" --conditions=browser ./src/index.ts "$@"
            '';

            tavern-install-bin = pkgs.writeShellScriptBin "tavern-install" ''
              set -euo pipefail

              CACHE_DIR="$HOME/.cache/tavern-nix"
              VERSION="''${1:-latest}"

              # Platform detection
              os=$(uname -s | tr '[:upper:]' '[:lower:]')
              case "$os" in
                darwin) os="darwin" ;;
                linux) os="linux" ;;
                *) echo "Unsupported OS: $os" >&2; exit 1 ;;
              esac

              arch=$(uname -m)
              case "$arch" in
                aarch64) arch="arm64" ;;
                x86_64) arch="x64" ;;
                *) echo "Unsupported architecture: $arch" >&2; exit 1 ;;
              esac

              # Rosetta 2 detection on macOS
              if [ "$os" = "darwin" ] && [ "$arch" = "x64" ]; then
                rosetta_flag=$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)
                if [ "$rosetta_flag" = "1" ]; then
                  arch="arm64"
                fi
              fi

              # Musl detection on Linux
              is_musl=""
              if [ "$os" = "linux" ]; then
                if [ -f /etc/alpine-release ] || (command -v ldd >/dev/null 2>&1 && ldd --version 2>&1 | grep -qi musl); then
                  is_musl="-musl"
                fi
              fi

              # AVX2 detection for baseline builds
              needs_baseline=""
              if [ "$arch" = "x64" ]; then
                if [ "$os" = "linux" ] && ! grep -qi avx2 /proc/cpuinfo 2>/dev/null; then
                  needs_baseline="-baseline"
                elif [ "$os" = "darwin" ]; then
                  avx2=$(sysctl -n hw.optional.avx2_0 2>/dev/null || echo 0)
                  if [ "$avx2" != "1" ]; then
                    needs_baseline="-baseline"
                  fi
                fi
              fi

              # Determine archive extension
              if [ "$os" = "linux" ]; then
                ext=".tar.gz"
              else
                ext=".zip"
              fi

              # Build filename and URL
              target="$os-$arch$needs_baseline$is_musl"
              filename="tavern-$target$ext"

              if [ "$VERSION" = "latest" ]; then
                url="https://github.com/Kilo-Org/kilocode/releases/latest/download/$filename"
                echo "Installing latest version of tavern..." >&2
              else
                # Strip leading 'v' if present
                VERSION="''${VERSION#v}"
                url="https://github.com/Kilo-Org/kilocode/releases/download/v''${VERSION}/$filename"
                echo "Installing tavern version $VERSION..." >&2
              fi

              # Create cache directory
              mkdir -p "$CACHE_DIR"

              # Download to temporary directory
              tmp_dir=$(mktemp -d)
              trap "rm -rf $tmp_dir" EXIT

              echo "Downloading from $url..." >&2
              if ! ${pkgs.curl}/bin/curl -fsSL -o "$tmp_dir/$filename" "$url"; then
                echo "Error: Failed to download tavern from $url" >&2
                echo "Please check your internet connection or visit https://github.com/Kilo-Org/kilocode/releases" >&2
                exit 1
              fi

              # Extract the archive
              echo "Extracting..." >&2
              if [ "$os" = "linux" ]; then
                ${pkgs.gnutar}/bin/tar -xzf "$tmp_dir/$filename" -C "$tmp_dir"
              else
                ${pkgs.unzip}/bin/unzip -q "$tmp_dir/$filename" -d "$tmp_dir"
              fi

              # Install the binary
              TAVERN_BIN="$CACHE_DIR/tavern"
              mv "$tmp_dir/tavern" "$TAVERN_BIN"
              chmod +x "$TAVERN_BIN"

              # Get the installed version
              installed_version=$("$TAVERN_BIN" --version 2>/dev/null || echo "unknown")
              echo "Successfully installed tavern $installed_version to $TAVERN_BIN" >&2
            '';

            tavern-bin = pkgs.writeShellScriptBin "tavern" ''
              set -euo pipefail

              CACHE_DIR="$HOME/.cache/tavern-nix"
              TAVERN_BIN="$CACHE_DIR/tavern"

              if [ ! -f "$TAVERN_BIN" ]; then
                echo "Error: tavern is not installed in the cache." >&2
                echo "Please run 'tavern-install' first to download and install tavern." >&2
                echo "" >&2
                echo "Examples:" >&2
                echo "  tavern-install          # Install latest version" >&2
                echo "  tavern-install 1.0.180  # Install specific version" >&2
                exit 1
              fi

              # Execute the cached binary with all arguments
              exec "$TAVERN_BIN" "$@"
            '';
          in
          pkgs.mkShell {
            packages =
              with pkgs;
              [
                bun
                nodejs_20
                python3
                pkg-config
                openssl
                git
                gh
                playwright-driver.browsers
                vsce
                unzip
                gnutar
                gzip
                patchelf
                ripgrep
                tavern-dev
                tavern-install-bin
                tavern-bin
              ]
              ++ lib.optionals stdenv.isLinux [
                libX11
                libXext
                libXrender
                libXtst
                libXi
                fontconfig
                freetype
              ];
            shellHook = ''
              export TAVERN_ROOT="$PWD"
              export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
              export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            ''
            + pkgs.lib.optionalString pkgs.stdenv.isLinux ''
              export LD_LIBRARY_PATH="${
                pkgs.lib.makeLibraryPath [
                  pkgs.libX11
                  pkgs.libXext
                  pkgs.libXrender
                  pkgs.libXtst
                  pkgs.libXi
                  pkgs.fontconfig
                  pkgs.freetype
                ]
              }:$LD_LIBRARY_PATH"
            '';
          };
      });

      overlays = {
        default =
          final: _prev:
          let
            node_modules = final.callPackage ./nix/node_modules.nix {
              inherit rev;
            };
            opencode = final.callPackage ./nix/opencode.nix {
              inherit node_modules;
            };
          in
          {
            inherit opencode;
          };
      };

      packages = forEachSystem (
        pkgs:
        let
          bun = pkgs.callPackage ./nix/bun.nix { };
          node_modules = pkgs.callPackage ./nix/node_modules.nix {
            inherit bun rev;
          };
          tavern = pkgs.callPackage ./nix/tavern.nix {
            inherit bun node_modules;
          };
        in
        {
          default = tavern;
          inherit tavern;
          # Updater derivation with fakeHash - build fails and reveals correct hash
          node_modules_updater = node_modules.override {
            hash = pkgs.lib.fakeHash;
          };
        }
      );
    };
}
